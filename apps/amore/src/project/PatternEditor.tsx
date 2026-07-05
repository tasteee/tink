import { createSignal, createEffect, onCleanup, For, Show, untrack } from 'solid-js'
import { convexClient } from '@amore/convex/client'
import { api } from '@convex/_generated/api'
import { beatsToTicks, snapTicksToGrid, ticksToBeats } from '@amore/music/timing'
import type { PatternLoopModeT, PatternSignalT } from '@amore/music/types'

type PatternEditorPropsT = {
	patternId: string
	patternLengthTicks: number
	gridTicks: number
	loopMode: PatternLoopModeT
	signals: PatternSignalT[]
	playheadTicks?: number | null
}

type ResizeStateT = { id: string; side: 'left' | 'right'; startX: number; initialDurationTicks: number; initialStartTicks: number } | null
type DragStateT = { id: string; startX: number; startY: number; initialStartTicks: number; initialNoteIndex: number } | null
type SignalPatchT = Partial<Pick<PatternSignalT, 'chordToneIndex' | 'octaveModifier' | 'startTicks' | 'durationTicks' | 'velocity' | 'probability' | 'isEnabled'>>

type MenuItemT = {
	value?: string
	label?: string
	shortcut?: string
	isDisabled?: boolean
	isSeparator?: boolean
	isDanger?: boolean
}

const PIXELS_PER_BEAT = 80
const ROW_HEIGHT = 40
const TOTAL_NOTE_ROWS = 8
const MIN_DURATION_TICKS = 60
const RESIZE_EDGE_WIDTH = 8
const DEFAULT_SIGNAL_DURATION_TICKS = beatsToTicks(0.5)
const DEFAULT_SIGNAL_VELOCITY = 100
const DEFAULT_SIGNAL_PROBABILITY = 1

const NOTE_LABELS = Array.from({ length: TOTAL_NOTE_ROWS }, (_, i) => `N${TOTAL_NOTE_ROWS - i}`)
const NOTE_INDEX_FOR_ROW = (rowIndex: number): number => TOTAL_NOTE_ROWS - rowIndex
const PATTERN_LENGTH_OPTIONS = [1, 2, 4, 8, 16].map((beats) => ({
	value: String(beatsToTicks(beats)),
	label: `${beats} beat${beats === 1 ? '' : 's'}`
}))
const GRID_OPTIONS = [
	{ value: String(beatsToTicks(0.125)), label: '1/8 beat' },
	{ value: String(beatsToTicks(0.25)), label: '1/4 beat' },
	{ value: String(beatsToTicks(0.5)), label: '1/2 beat' },
	{ value: String(beatsToTicks(1)), label: '1 beat' }
]
const LOOP_MODE_OPTIONS: { value: PatternLoopModeT; label: string }[] = [
	{ value: 'loopAcrossProgression', label: 'Loop' },
	{ value: 'restartOnChord', label: 'Restart' }
]

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))

export const PatternEditor = (props: PatternEditorPropsT) => {
	const [selectedId, setSelectedId] = createSignal<string | null>(null)
	const [resizeState, setResizeState] = createSignal<ResizeStateT>(null)
	const [dragState, setDragState] = createSignal<DragStateT>(null)
	const [localCreates, setLocalCreates] = createSignal<PatternSignalT[]>([])
	const [localUpdates, setLocalUpdates] = createSignal<Record<string, SignalPatchT>>({})
	const [localDeletes, setLocalDeletes] = createSignal<Record<string, true>>({})
	let gridRef: HTMLDivElement | undefined
	let tempSignalCounter = 0

	const patternLengthBeats = () => ticksToBeats(props.patternLengthTicks)
	const patternWidth = () => patternLengthBeats() * PIXELS_PER_BEAT
	const playheadLeft = () => ticksToBeats(props.playheadTicks ?? 0) * PIXELS_PER_BEAT
	const visibleSignals = () => {
		const deleted = localDeletes()
		const updates = localUpdates()
		const serverIds = new Set(props.signals.map((signal) => signal._id))
		const serverSignals = props.signals
			.filter((signal) => deleted[signal._id] !== true)
			.map((signal) => ({ ...signal, ...(updates[signal._id] ?? {}) }))
		const pendingSignals = localCreates()
			.filter((signal) => deleted[signal._id] !== true && !serverIds.has(signal._id))
			.map((signal) => ({ ...signal, ...(updates[signal._id] ?? {}) }))
		return [...serverSignals, ...pendingSignals].filter((signal) => signal.startTicks < props.patternLengthTicks)
	}
	const maxStartTicks = (): number => Math.max(0, props.patternLengthTicks - MIN_DURATION_TICKS)

	const getGridOffset = (): { left: number; top: number } => {
		const rect = gridRef?.getBoundingClientRect()
		return { left: rect?.left ?? 0, top: rect?.top ?? 0 }
	}

	const beatFromX = (clientX: number): number => {
		const offset = getGridOffset()
		const x = clientX - offset.left + (gridRef?.scrollLeft ?? 0)
		return Math.max(0, Math.min(patternLengthBeats(), x / PIXELS_PER_BEAT))
	}

	const rowIndexFromY = (clientY: number): number => {
		const offset = getGridOffset()
		const y = clientY - offset.top
		return Math.max(0, Math.min(TOTAL_NOTE_ROWS - 1, Math.floor(y / ROW_HEIGHT)))
	}

	const noteIndexFromPointerTarget = (target: EventTarget | null, clientY: number): number => {
		const element = target instanceof HTMLElement ? target : null
		const row = element?.closest<HTMLElement>('.signalEditorRow')
		const noteIndex = Number(row?.dataset.noteIndex)
		if (Number.isFinite(noteIndex) && noteIndex >= 1 && noteIndex <= TOTAL_NOTE_ROWS) return noteIndex
		return NOTE_INDEX_FOR_ROW(rowIndexFromY(clientY))
	}

	const createTempSignalId = (): string => `pending-signal:${Date.now()}:${tempSignalCounter++}`
	const isPendingSignalId = (id: string): boolean => id.startsWith('pending-signal:')

	const patchMatchesSignal = (signal: PatternSignalT, patch: SignalPatchT): boolean => {
		return Object.entries(patch).every(([key, value]) => signal[key as keyof SignalPatchT] === value)
	}

	const applyLocalUpdate = (id: string, patch: SignalPatchT): void => {
		setLocalUpdates((updates) => ({
			...updates,
			[id]: { ...(updates[id] ?? {}), ...patch }
		}))
	}

	const clearLocalUpdate = (id: string): void => {
		setLocalUpdates((updates) => {
			if (updates[id] === undefined) return updates
			const next = { ...updates }
			delete next[id]
			return next
		})
	}

	const removeLocalCreate = (id: string): void => {
		setLocalCreates((signals) => signals.filter((signal) => signal._id !== id))
	}

	const markSignalDeleted = (id: string): void => {
		setSelectedId((selected) => (selected === id ? null : selected))
		setLocalCreates((signals) => signals.filter((signal) => signal._id !== id))
		setLocalDeletes((deleted) => ({ ...deleted, [id]: true }))
		clearLocalUpdate(id)
	}

	const unmarkSignalDeleted = (id: string): void => {
		setLocalDeletes((deleted) => {
			if (deleted[id] !== true) return deleted
			const next = { ...deleted }
			delete next[id]
			return next
		})
	}

	const hasSignalModifiers = (signal: PatternSignalT): boolean => {
		return (
			signal.octaveModifier !== 0 ||
			signal.velocity !== DEFAULT_SIGNAL_VELOCITY ||
			(signal.probability ?? DEFAULT_SIGNAL_PROBABILITY) !== DEFAULT_SIGNAL_PROBABILITY
		)
	}

	const signalMenuItems = (signal: PatternSignalT): MenuItemT[] => {
		const probabilityPercent = Math.round((signal.probability ?? DEFAULT_SIGNAL_PROBABILITY) * 100)
		return [
			{ value: 'duplicate', label: 'Duplicate' },
			{ value: 'toggle.enabled', label: signal.isEnabled === false ? 'Enable' : 'Disable' },
			{ isSeparator: true },
			{ value: 'octave.down', label: 'Octave -', shortcut: signal.octaveModifier >= 0 ? `+${signal.octaveModifier}` : String(signal.octaveModifier) },
			{ value: 'octave.up', label: 'Octave +' },
			{ value: 'velocity.down', label: 'Velocity -5', shortcut: String(signal.velocity) },
			{ value: 'velocity.up', label: 'Velocity +5' },
			{ value: 'probability.down', label: 'Probability -10%', shortcut: `${probabilityPercent}%` },
			{ value: 'probability.up', label: 'Probability +10%' },
			{ isSeparator: true },
			{ value: 'reset', label: 'Reset signal', isDisabled: !hasSignalModifiers(signal) },
			{ value: 'remove', label: 'Remove', isDanger: true }
		]
	}

	const updateSignal = async (signal: PatternSignalT, patch: Partial<PatternSignalT>): Promise<void> => {
		if (isPendingSignalId(signal._id)) {
			setLocalCreates((signals) => signals.map((created) => (created._id === signal._id ? { ...created, ...patch } : created)))
			return
		}

		applyLocalUpdate(signal._id, patch)
		const args: Record<string, unknown> = { patternId: props.patternId, id: signal._id }
		if (patch.chordToneIndex !== undefined) args.chordToneIndex = patch.chordToneIndex
		if (patch.octaveModifier !== undefined) args.octaveModifier = patch.octaveModifier
		if (patch.startTicks !== undefined) args.startTicks = patch.startTicks
		if (patch.durationTicks !== undefined) args.durationTicks = patch.durationTicks
		if (patch.velocity !== undefined) args.velocity = patch.velocity
		if (patch.probability !== undefined) args.probability = patch.probability
		if (patch.isEnabled !== undefined) args.isEnabled = patch.isEnabled
		try {
			await convexClient.mutation(api.patterns.updateSignal, args as any)
		} catch (error) {
			clearLocalUpdate(signal._id)
			console.error('[amore] failed to update signal', error)
		}
	}

	const handleSignalMenuSelect = async (event: Event, signal: PatternSignalT): Promise<void> => {
		const value = (event as CustomEvent<{ value: string }>).detail.value
		const probability = signal.probability ?? DEFAULT_SIGNAL_PROBABILITY

		if (value === 'duplicate') {
			const tempId = createTempSignalId()
			const nextStartTicks = Math.min(signal.startTicks + signal.durationTicks, maxStartTicks())
			const clone = { ...signal, _id: tempId, startTicks: nextStartTicks }
			setLocalCreates((signals) => [...signals, clone])
			setSelectedId(tempId)
			try {
				const id = isPendingSignalId(signal._id)
					? await convexClient.mutation(api.patterns.addSignal, {
							patternId: props.patternId as any,
							chordToneIndex: clone.chordToneIndex,
							octaveModifier: clone.octaveModifier,
							startTicks: clone.startTicks,
							durationTicks: clone.durationTicks,
							velocity: clone.velocity
						})
					: await convexClient.mutation(api.patterns.duplicateSignal, { patternId: props.patternId as any, id: signal._id })
				setLocalCreates((signals) => signals.map((created) => (created._id === tempId ? { ...created, _id: String(id) } : created)))
				setSelectedId((selected) => (selected === tempId ? String(id) : selected))
			} catch (error) {
				removeLocalCreate(tempId)
				console.error('[amore] failed to duplicate signal', error)
			}
			return
		}
		if (value === 'remove') {
			markSignalDeleted(signal._id)
			if (isPendingSignalId(signal._id)) return
			try {
				await convexClient.mutation(api.patterns.removeSignal, { patternId: props.patternId as any, id: signal._id })
			} catch (error) {
				unmarkSignalDeleted(signal._id)
				console.error('[amore] failed to remove signal', error)
			}
			return
		}
		if (value === 'toggle.enabled') await updateSignal(signal, { isEnabled: signal.isEnabled === false })
		if (value === 'octave.down') await updateSignal(signal, { octaveModifier: clamp(signal.octaveModifier - 1, -3, 3) })
		if (value === 'octave.up') await updateSignal(signal, { octaveModifier: clamp(signal.octaveModifier + 1, -3, 3) })
		if (value === 'velocity.down') await updateSignal(signal, { velocity: clamp(signal.velocity - 5, 1, 127) })
		if (value === 'velocity.up') await updateSignal(signal, { velocity: clamp(signal.velocity + 5, 1, 127) })
		if (value === 'probability.down') await updateSignal(signal, { probability: clamp(probability - 0.1, 0, 1) })
		if (value === 'probability.up') await updateSignal(signal, { probability: clamp(probability + 0.1, 0, 1) })
		if (value === 'reset') {
			await updateSignal(signal, {
				octaveModifier: 0,
				velocity: DEFAULT_SIGNAL_VELOCITY,
				probability: DEFAULT_SIGNAL_PROBABILITY
			})
		}
	}

	const handlePatternLengthChange = async (event: Event): Promise<void> => {
		const value = Number((event as CustomEvent<{ value: string }>).detail.value)
		if (!Number.isFinite(value)) return
		await convexClient.mutation(api.patterns.update, {
			id: props.patternId as any,
			durationTicks: value
		})
	}

	const handleGridChange = async (event: Event): Promise<void> => {
		const value = Number((event as CustomEvent<{ value: string }>).detail.value)
		if (!Number.isFinite(value)) return
		await convexClient.mutation(api.patterns.update, {
			id: props.patternId as any,
			gridTicks: value
		})
	}

	const handleLoopModeChange = async (event: Event): Promise<void> => {
		const value = (event as CustomEvent<{ value: PatternLoopModeT }>).detail.value
		await convexClient.mutation(api.patterns.update, {
			id: props.patternId as any,
			loopMode: value
		})
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		const id = selectedId()
		if (id === null) return
		if (event.key !== 'Backspace' && event.key !== 'Delete') return
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
		event.preventDefault()
		markSignalDeleted(id)
		if (isPendingSignalId(id)) return
		void convexClient.mutation(api.patterns.removeSignal, { patternId: props.patternId as any, id }).catch((error) => {
			unmarkSignalDeleted(id)
			console.error('[amore] failed to remove signal', error)
		})
	}

	createEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		onCleanup(() => document.removeEventListener('keydown', handleKeyDown))
	})

	const handleGridMouseDown = async (event: MouseEvent) => {
		if (event.button !== 0) return
		if (event.target !== gridRef && !((event.target as HTMLElement).classList.contains('signalEditorRow') || (event.target as HTMLElement).classList.contains('signalEditorBeat'))) return
		const startTicks = snapTicksToGrid(beatsToTicks(beatFromX(event.clientX)), props.gridTicks)
		const clampedStartTicks = Math.min(startTicks, maxStartTicks())
		const noteIndex = noteIndexFromPointerTarget(event.target, event.clientY)
		const tempId = createTempSignalId()
		const signal: PatternSignalT = {
			_id: tempId,
			chordToneIndex: noteIndex,
			octaveModifier: 0,
			startTicks: clampedStartTicks,
			durationTicks: Math.min(DEFAULT_SIGNAL_DURATION_TICKS, props.patternLengthTicks - clampedStartTicks),
			velocity: DEFAULT_SIGNAL_VELOCITY,
			probability: DEFAULT_SIGNAL_PROBABILITY
		}
		setLocalCreates((signals) => [...signals, signal])
		setSelectedId(tempId)
		try {
			const id = await convexClient.mutation(api.patterns.addSignal, {
				patternId: props.patternId as any,
				chordToneIndex: signal.chordToneIndex,
				octaveModifier: signal.octaveModifier,
				startTicks: signal.startTicks,
				durationTicks: signal.durationTicks,
				velocity: signal.velocity
			})
			const wasDeletedBeforeSave = !untrack(localCreates).some((created) => created._id === tempId)
			if (wasDeletedBeforeSave) {
				await convexClient.mutation(api.patterns.removeSignal, { patternId: props.patternId as any, id })
				return
			}
			setLocalCreates((signals) => signals.map((created) => (created._id === tempId ? { ...created, _id: String(id) } : created)))
			setSelectedId((selected) => (selected === tempId ? String(id) : selected))
		} catch (error) {
			removeLocalCreate(tempId)
			console.error('[amore] failed to add signal', error)
		}
	}

	const handleSignalMouseDown = (signal: PatternSignalT, event: MouseEvent) => {
		if (event.button !== 0) return
		event.stopPropagation()
		const target = event.currentTarget as HTMLElement
		const rect = target.getBoundingClientRect()
		const offsetX = event.clientX - rect.left
		const isLeftEdge = offsetX < RESIZE_EDGE_WIDTH
		const isRightEdge = offsetX > rect.width - RESIZE_EDGE_WIDTH

		setSelectedId(signal._id)

		if (isLeftEdge || isRightEdge) {
			setResizeState({
				id: signal._id,
				side: isLeftEdge ? 'left' : 'right',
				startX: event.clientX,
				initialDurationTicks: signal.durationTicks,
				initialStartTicks: signal.startTicks
			})
			return
		}

		setDragState({
			id: signal._id,
			startX: event.clientX,
			startY: event.clientY,
			initialStartTicks: signal.startTicks,
			initialNoteIndex: signal.chordToneIndex
		})
	}

	const handleMouseMove = (_event: MouseEvent) => {
		if (resizeState() !== null) return
		if (dragState() !== null) return
	}

	const handleMouseUp = async (event: MouseEvent) => {
		const resize = resizeState()
		if (resize !== null) {
			const deltaX = event.clientX - resize.startX
			const deltaTicks = beatsToTicks(deltaX / PIXELS_PER_BEAT)
			let newStartTicks = resize.initialStartTicks
			let newDurationTicks = resize.initialDurationTicks
			if (resize.side === 'right') {
				newDurationTicks = Math.max(MIN_DURATION_TICKS, resize.initialDurationTicks + deltaTicks)
			} else {
				const startDeltaTicks = Math.min(deltaTicks, resize.initialDurationTicks - MIN_DURATION_TICKS)
				newStartTicks = clamp(resize.initialStartTicks + startDeltaTicks, 0, maxStartTicks())
				newDurationTicks = Math.max(MIN_DURATION_TICKS, resize.initialDurationTicks - startDeltaTicks)
			}
			newDurationTicks = Math.min(newDurationTicks, props.patternLengthTicks - newStartTicks)
			const signal = visibleSignals().find((item) => item._id === resize.id)
			if (signal !== undefined) await updateSignal(signal, {
				startTicks: snapTicksToGrid(newStartTicks, props.gridTicks),
				durationTicks: Math.max(MIN_DURATION_TICKS, snapTicksToGrid(newDurationTicks, props.gridTicks))
			})
			setResizeState(null)
			return
		}

		const drag = dragState()
		if (drag !== null) {
			const deltaX = event.clientX - drag.startX
			const deltaY = event.clientY - drag.startY
			const deltaTicks = beatsToTicks(deltaX / PIXELS_PER_BEAT)
			const deltaRow = Math.round(deltaY / ROW_HEIGHT)
			const newStartTicks = clamp(drag.initialStartTicks + deltaTicks, 0, maxStartTicks())
			const newNoteIndex = Math.max(1, Math.min(TOTAL_NOTE_ROWS, drag.initialNoteIndex - deltaRow))
			const signal = visibleSignals().find((item) => item._id === drag.id)
			if (signal !== undefined) await updateSignal(signal, {
				startTicks: snapTicksToGrid(newStartTicks, props.gridTicks),
				chordToneIndex: newNoteIndex
			})
			setDragState(null)
		}
	}

	createEffect(() => {
		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)
		onCleanup(() => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		})
	})

	createEffect(() => {
		const playheadTicks = props.playheadTicks
		if (playheadTicks === null || playheadTicks === undefined || gridRef === undefined) return
		const left = playheadLeft()
		const start = gridRef.scrollLeft
		const end = start + gridRef.clientWidth
		if (left < start + 32 || left > end - 80) {
			gridRef.scrollTo({ left: Math.max(0, left - gridRef.clientWidth / 2), behavior: 'smooth' })
		}
	})

	createEffect(() => {
		const serverSignals = props.signals
		const serverIds = new Set(serverSignals.map((signal) => signal._id))
		untrack(() => {
			setLocalCreates((signals) => signals.filter((signal) => !serverIds.has(signal._id)))
			setLocalDeletes((deleted) => {
				const next: Record<string, true> = {}
				for (const id of Object.keys(deleted)) {
					if (serverIds.has(id)) next[id] = true
				}
				return next
			})
			setLocalUpdates((updates) => {
				const next: Record<string, SignalPatchT> = {}
				for (const [id, patch] of Object.entries(updates)) {
					const signal = serverSignals.find((item) => item._id === id)
					if (signal !== undefined && !patchMatchesSignal(signal, patch)) next[id] = patch
				}
				return next
			})
		})
	})

	return (
		<div class="signalEditor">
			<div class="signalEditorControls">
				<div class="signalEditorControlGroup">
					<span class="signalEditorControlLabel">Length</span>
					<z-select options={PATTERN_LENGTH_OPTIONS} value={String(props.patternLengthTicks)} size="small" isInline on:change={(event: Event) => void handlePatternLengthChange(event)} />
				</div>
				<div class="signalEditorControlGroup">
					<span class="signalEditorControlLabel">Grid</span>
					<z-select options={GRID_OPTIONS} value={String(props.gridTicks)} size="small" isInline on:change={(event: Event) => void handleGridChange(event)} />
				</div>
				<div class="signalEditorControlGroup">
					<span class="signalEditorControlLabel">Mode</span>
					<z-select options={LOOP_MODE_OPTIONS} value={props.loopMode} size="small" isInline on:change={(event: Event) => void handleLoopModeChange(event)} />
				</div>
				<span class="signalEditorMeta">{visibleSignals().length} signal{visibleSignals().length === 1 ? '' : 's'}</span>
			</div>

			<div class="signalEditorBody" style={{ height: `${TOTAL_NOTE_ROWS * ROW_HEIGHT}px` }}>
				<div class="signalEditorRowLabels">
					<For each={NOTE_LABELS}>
						{(label) => <div class="signalRowLabel">{label}</div>}
					</For>
				</div>

				<div
					class="signalEditorGrid"
					ref={gridRef}
					style={{ width: `${patternWidth()}px`, 'min-width': '100%' }}
					onMouseDown={handleGridMouseDown}
				>
					<div class="signalEditorGridInner" style={{ 'min-width': `${patternWidth()}px` }}>
						<Show when={props.playheadTicks !== null && props.playheadTicks !== undefined}>
							<div class="signalEditorPlayhead" style={{ left: `${playheadLeft()}px` }} />
						</Show>
						<For each={NOTE_LABELS}>
							{(_, rowIndex) => {
								const noteIndex = NOTE_INDEX_FOR_ROW(rowIndex())
								const rowSignals = () => visibleSignals().filter((signal) => signal.chordToneIndex === noteIndex).sort((a, b) => a.startTicks - b.startTicks)

								return (
									<div class="signalEditorRow" data-note-index={noteIndex}>
										<For each={Array.from({ length: patternLengthBeats() * 2 })}>
											{() => (
												<div
													class="signalEditorBeat"
													style={{ width: `${PIXELS_PER_BEAT / 2}px` }}
												/>
											)}
										</For>

										<For each={rowSignals()}>
											{(signal) => {
												const left = () => ticksToBeats(signal.startTicks) * PIXELS_PER_BEAT
												const width = () => ticksToBeats(signal.durationTicks) * PIXELS_PER_BEAT
												const isSelected = () => selectedId() === signal._id

												return (
													<z-context-menu items={signalMenuItems(signal)} on:select={(event: Event) => void handleSignalMenuSelect(event, signal)}>
														<div
															class={`signalBlock${isSelected() ? ' isSelected' : ''}${signal.isEnabled === false ? ' isDisabled' : ''}${hasSignalModifiers(signal) ? ' hasModifiers' : ''}`}
															style={{
																left: `${left()}px`,
																width: `${Math.max(8, width())}px`
															}}
															onMouseDown={(event) => handleSignalMouseDown(signal, event)}
														>
															<div class="signalBlockResizeHandle left" />
															<span>N{signal.chordToneIndex}</span>
															<span class="signalBlockModifierIndicator" title="Modified" />
															<div class="signalBlockResizeHandle right" />
														</div>
													</z-context-menu>
												)
											}}
										</For>
									</div>
								)
							}}
						</For>
					</div>
				</div>
			</div>
		</div>
	)
}
