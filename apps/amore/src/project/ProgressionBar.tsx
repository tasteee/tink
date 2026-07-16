import { createSignal, createEffect, onCleanup, For, Show } from 'solid-js'
import { expandChord, getChordQualityLabel, resolveChordRootName } from '@amore/music/theory'
import { startPreview, stopPreview } from '@amore/music/audio'
import { beatsToTicks, snapTicksToGrid, ticksToBeats } from '@amore/music/timing'
import type { ChordVoicingT, ProgressionChordItemT, ProgressionItemT, ScaleTypeT } from '@amore/music/types'
import { CHORD_CARD_DRAG_GROUP, CHORD_CARD_DRAG_TYPE, isChordSnapshot, type ChordSnapshotT } from './ChordCard'

type ProgressionBarPropsT = {
	items: ProgressionItemT[]
	onItemsChange: (items: ProgressionItemT[]) => void
	projectKey: string
	projectScale: ScaleTypeT
	projectRootOctave: number
	playheadTicks?: number | null
	onDownloadProgressionMidi: () => void
	onDownloadPerformanceMidi: () => void
	isProgressionMidiDisabled?: boolean
	isPerformanceMidiDisabled?: boolean
}

const PIXELS_PER_BEAT = 80
const BEATS_PER_BAR = 4
const TIMELINE_BAR_COUNT = 100
const MIN_DURATION_TICKS = 120
const RESIZE_DURATION_GRID_TICKS = MIN_DURATION_TICKS
const BEAT_INCREMENT_TICKS = beatsToTicks(1)
const DEFAULT_INVERSION = 0
const DEFAULT_VOICING: ChordVoicingT = 'closed'
const DEFAULT_OCTAVE_OFFSET = 0
const DEFAULT_VELOCITY_MIN = 72
const DEFAULT_VELOCITY_MAX = 112
const VOICING_OPTIONS: ChordVoicingT[] = ['closed', 'open', 'drop2', 'spread']
const VOICING_LABELS: Record<ChordVoicingT, string> = {
	closed: 'Closed',
	open: 'Open',
	drop2: 'Drop 2',
	spread: 'Spread'
}

const RESIZE_EDGE_WIDTH = 10
const PROGRESSION_ITEM_DRAG_TYPE = 'amore-progression-item'

type ResizeStateT = { id: string; side: 'left' | 'right'; startX: number; initialDurationTicks: number } | null
type ChordDropDetailT = { data: unknown; x: number; y: number }
type ProgressionItemDragDataT = { kind: 'progressionItem'; itemId: string }

type ChordModifierStateT = {
	inversion: number
	voicing: ChordVoicingT
	octaveOffset: number
	velocityMin: number
	velocityMax: number
}

type ProgressionItemDraftT = Partial<ChordModifierStateT> & {
	durationTicks?: number
	isEnabled?: boolean
}

type MenuItemT = {
	value?: string
	label?: string
	shortcut?: string
	isDisabled?: boolean
	isSeparator?: boolean
	isDanger?: boolean
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value))
const makeLocalItemId = (): string => `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
const snapDurationTicks = (durationTicks: number): number => {
	return Math.max(MIN_DURATION_TICKS, snapTicksToGrid(durationTicks, RESIZE_DURATION_GRID_TICKS))
}

const normalizeItems = (items: ProgressionItemT[]): ProgressionItemT[] => {
	return [...items].map((item, order) => ({ ...item, order }) as ProgressionItemT)
}

const DownloadIcon = () => (
	<svg class="progressionMidiButtonIcon" viewBox="0 0 24 24" aria-hidden="true">
		<path d="M12 3v11" />
		<path d="m7 10 5 5 5-5" />
		<path d="M5 20h14" />
	</svg>
)

export const ProgressionBar = (props: ProgressionBarPropsT) => {
	const [selectedId, setSelectedId] = createSignal<string | null>(null)
	const [resizeState, setResizeState] = createSignal<ResizeStateT>(null)
	const [internalDragId, setInternalDragId] = createSignal<string | null>(null)
	const [internalInsertIndex, setInternalInsertIndex] = createSignal<number | null>(null)
	const [externalChordDrag, setExternalChordDrag] = createSignal<ChordSnapshotT | null>(null)
	const [externalInsertIndex, setExternalInsertIndex] = createSignal<number | null>(null)

	const sortedItems = () => [...props.items].sort((a, b) => a.order - b.order)
	const timelineWidth = () => TIMELINE_BAR_COUNT * BEATS_PER_BAR * PIXELS_PER_BEAT
	const timelineBeats = () => Array.from({ length: TIMELINE_BAR_COUNT * BEATS_PER_BAR + 1 }, (_, beat) => beat)
	const playheadLeft = () => ticksToBeats(props.playheadTicks ?? 0) * PIXELS_PER_BEAT
	const hasExternalChordPreview = () => externalChordDrag() !== null && externalInsertIndex() !== null
	const activeInternalDragItem = () => sortedItems().find((item) => item._id === internalDragId()) ?? null
	const hasInternalItemPreview = () => activeInternalDragItem() !== null && internalInsertIndex() !== null

	const modifiersForItem = (item: ProgressionChordItemT): ChordModifierStateT => ({
		inversion: item.inversion ?? DEFAULT_INVERSION,
		voicing: item.voicing ?? DEFAULT_VOICING,
		octaveOffset: item.octaveOffset ?? DEFAULT_OCTAVE_OFFSET,
		velocityMin: item.velocityMin ?? DEFAULT_VELOCITY_MIN,
		velocityMax: item.velocityMax ?? DEFAULT_VELOCITY_MAX
	})

	const updateLocalItems = (items: ProgressionItemT[]): void => {
		props.onItemsChange(normalizeItems(items))
	}

	const patchLocalItem = (id: string, patch: ProgressionItemDraftT): void => {
		updateLocalItems(
			sortedItems().map((item) => {
				if (item._id !== id) return item
				return { ...item, ...patch } as ProgressionItemT
			})
		)
	}

	const duplicateLocalItem = (item: ProgressionItemT): ProgressionItemT | null => {
		const items = sortedItems()
		const index = items.findIndex((candidate) => candidate._id === item._id)
		if (index === -1) return null
		const clone = { ...item, _id: makeLocalItemId(), order: item.order + 1 } as ProgressionItemT
		updateLocalItems([...items.slice(0, index + 1), clone, ...items.slice(index + 1)])
		return clone
	}

	const removeLocalItem = (id: string): void => {
		if (selectedId() === id) setSelectedId(null)
		updateLocalItems(sortedItems().filter((item) => item._id !== id))
	}

	const hasItemModifiers = (item: ProgressionItemT): boolean => {
		if (item.type !== 'chord') return false
		const modifiers = modifiersForItem(item)
		return (
			modifiers.inversion !== DEFAULT_INVERSION ||
			modifiers.voicing !== DEFAULT_VOICING ||
			modifiers.octaveOffset !== DEFAULT_OCTAVE_OFFSET ||
			modifiers.velocityMin !== DEFAULT_VELOCITY_MIN ||
			modifiers.velocityMax !== DEFAULT_VELOCITY_MAX
		)
	}

	const previewIdForItem = (item: ProgressionItemT): string => `progression-${item._id}`

	const previewItem = (item: ProgressionItemT): void => {
		if (item.type !== 'chord') return
		if (item.isEnabled === false) return
		const modifiers = modifiersForItem(item)
		const root = resolveChordRootName(item.root, props.projectKey, props.projectScale)
		const notes = expandChord(
			root,
			item.qualityId,
			modifiers.inversion,
			props.projectRootOctave + modifiers.octaveOffset,
			modifiers.voicing
		)
		const velocity = Math.round((modifiers.velocityMin + modifiers.velocityMax) / 2)
		startPreview(previewIdForItem(item), notes, velocity)
	}

	const stopItemPreview = (item: ProgressionItemT): void => {
		stopPreview(previewIdForItem(item))
	}

	const itemMenuItems = (item: ProgressionItemT): MenuItemT[] => {
		const baseItems: MenuItemT[] = [
			{ value: 'duplicate', label: 'Duplicate' },
			{ value: 'duration.up', label: 'Duration +1 beat', shortcut: `${ticksToBeats(item.durationTicks)}b` },
			{ value: 'duration.down', label: 'Duration -1 beat', isDisabled: item.durationTicks <= MIN_DURATION_TICKS },
			{ isSeparator: true }
		]

		if (item.type !== 'chord') {
			return [...baseItems, { value: 'remove', label: 'Remove', isDanger: true }]
		}

		const modifiers = modifiersForItem(item)
		return [
			...baseItems,
			{ value: 'toggle.enabled', label: item.isEnabled === false ? 'Enable' : 'Disable' },
			{ isSeparator: true },
			{ value: 'reset', label: 'Reset modifiers', isDisabled: !hasItemModifiers(item) },
			{ value: 'remove', label: 'Remove', isDanger: true }
		]
	}

	const updateItemDuration = (item: ProgressionItemT, durationTicks: number): void => {
		patchLocalItem(item._id, { durationTicks: snapDurationTicks(durationTicks) })
	}

	const updateItemEnabled = (item: ProgressionChordItemT, isEnabled: boolean): void => {
		patchLocalItem(item._id, { isEnabled })
	}

	const updateItemModifiers = (item: ProgressionChordItemT, modifiers: ChordModifierStateT): void => {
		patchLocalItem(item._id, modifiers)
	}

	const handleItemMenuSelect = (event: Event, item: ProgressionItemT): void => {
		const value = (event as CustomEvent<{ value: string }>).detail.value

		if (value === 'duplicate') {
			duplicateLocalItem(item)
			return
		}
		if (value === 'remove') {
			removeLocalItem(item._id)
			return
		}
		if (value === 'duration.up' || value === 'duration.down') {
			const delta = value === 'duration.up' ? BEAT_INCREMENT_TICKS : -BEAT_INCREMENT_TICKS
			updateItemDuration(item, item.durationTicks + delta)
			return
		}
		if (item.type !== 'chord') return

		if (value === 'toggle.enabled') {
			updateItemEnabled(item, item.isEnabled === false)
			return
		}
		if (value === 'reset') {
			updateItemModifiers(item, {
				inversion: DEFAULT_INVERSION,
				voicing: DEFAULT_VOICING,
				octaveOffset: DEFAULT_OCTAVE_OFFSET,
				velocityMin: DEFAULT_VELOCITY_MIN,
				velocityMax: DEFAULT_VELOCITY_MAX
			})
			return
		}
	}

	const handleStepperInput = (value: string, fallback: number, min: number, max: number): number => {
		const numericValue = Number(value)
		if (!Number.isFinite(numericValue)) return fallback
		return clamp(Math.round(numericValue), min, max)
	}

	const renderModifierStepper = (
		label: string,
		value: number,
		min: number,
		max: number,
		onChange: (value: number) => void
	) => (
		<z-column class="modifierMenuField">
			<span class="modifierMenuLabel">{label}</span>
			<z-row class="modifierStepper">
				<z-button size="small" kind="outline" tone="neutral" on:click={() => onChange(clamp(value - 1, min, max))}>
					-
				</z-button>
				<z-input
					type="number"
					size="small"
					value={String(value)}
					on:change={(event: Event) =>
						onChange(handleStepperInput((event as CustomEvent<{ value: string }>).detail.value, value, min, max))
					}
				/>
				<z-button size="small" kind="outline" tone="neutral" on:click={() => onChange(clamp(value + 1, min, max))}>
					+
				</z-button>
			</z-row>
		</z-column>
	)

	const renderItemModifierControls = (item: ProgressionItemT) => {
		if (item.type !== 'chord') return null

		const modifiers = () => modifiersForItem(item)
		const updateModifiers = (patch: Partial<ChordModifierStateT>) => {
			updateItemModifiers(item, { ...modifiers(), ...patch })
		}
		const rangeKey = () => `${item._id}-${modifiers().velocityMin}-${modifiers().velocityMax}`

		return (
			<z-column
				slot="controls"
				class="modifierMenuControls"
				onMouseDown={(event) => event.stopPropagation()}
				onClick={(event) => event.stopPropagation()}
				onContextMenu={(event) => event.preventDefault()}
			>
				<z-column class="modifierMenuField">
					<span class="modifierMenuLabel">Voicing</span>
					<z-select
						options={VOICING_OPTIONS.map((option) => ({ value: option, label: VOICING_LABELS[option] }))}
						value={modifiers().voicing}
						size="small"
						on:change={(event: Event) =>
							updateModifiers({ voicing: (event as CustomEvent<{ value: ChordVoicingT }>).detail.value })
						}
					/>
				</z-column>

				<Show keyed when={rangeKey()}>
					<z-range
						min={1}
						max={127}
						step={1}
						label="Velocity"
						showValue
						on:change={(event: Event) => {
							const detail = (event as CustomEvent<{ left: number; right: number }>).detail
							updateModifiers({ velocityMin: detail.left, velocityMax: detail.right })
						}}
					>
						<z-range-handle value={modifiers().velocityMin} />
						<z-range-handle value={modifiers().velocityMax} />
					</z-range>
				</Show>

				{renderModifierStepper('Inversion', modifiers().inversion, 0, 8, (value) => updateModifiers({ inversion: value }))}
				{renderModifierStepper('Octave', modifiers().octaveOffset, -3, 3, (value) =>
					updateModifiers({ octaveOffset: value })
				)}
			</z-column>
		)
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		const id = selectedId()
		if (id === null) return
		if (event.key !== 'Backspace' && event.key !== 'Delete') return
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
		event.preventDefault()
		removeLocalItem(id)
	}

	createEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		onCleanup(() => document.removeEventListener('keydown', handleKeyDown))
	})

	const handleMouseDownOnBlock = (item: ProgressionItemT, event: MouseEvent) => {
		if (event.button !== 0) return
		event.stopPropagation()
		setSelectedId(item._id)
		previewItem(item)
	}

	const handleResizeMouseDown = (item: ProgressionItemT, side: 'left' | 'right', event: MouseEvent) => {
		if (event.button !== 0) return
		event.preventDefault()
		event.stopPropagation()
		setSelectedId(item._id)
		previewItem(item)
		setResizeState({
			id: item._id,
			side,
			startX: event.clientX,
			initialDurationTicks: item.durationTicks
		})
	}

	const getResizeDurationTicks = (resize: NonNullable<ResizeStateT>, clientX: number): number => {
		const deltaX = clientX - resize.startX
		const deltaTicks = beatsToTicks(deltaX / PIXELS_PER_BEAT)
		return snapDurationTicks(resize.initialDurationTicks + (resize.side === 'right' ? deltaTicks : -deltaTicks))
	}

	const handleMouseMove = (event: MouseEvent) => {
		const resize = resizeState()
		if (resize !== null) {
			patchLocalItem(resize.id, { durationTicks: getResizeDurationTicks(resize, event.clientX) })
			return
		}
	}

	let laneRef: HTMLDivElement | undefined
	let laneContentRef: HTMLDivElement | undefined
	const laneOffsetX = () => laneContentRef?.getBoundingClientRect().left ?? laneRef?.getBoundingClientRect().left ?? 0

	const isProgressionItemDragData = (value: unknown): value is ProgressionItemDragDataT => {
		return value !== null && typeof value === 'object' && (value as ProgressionItemDragDataT).kind === 'progressionItem'
	}

	const getDropInsertIndex = (clientX: number, movingItemId?: string): number => {
		const items = sortedItems().filter((item) => item._id !== movingItemId)
		if (items.length === 0) return 0

		const blocks = Array.from(laneRef?.querySelectorAll<HTMLElement>('.progressionChordBlock') ?? [])
			.filter((block) => block.dataset.itemId !== movingItemId)
			.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
		if (blocks.length === items.length) {
			for (let index = 0; index < blocks.length; index++) {
				const rect = blocks[index].getBoundingClientRect()
				if (clientX < rect.left + rect.width / 2) return index
			}
			return items.length
		}

		let cursor = laneOffsetX()
		for (let index = 0; index < items.length; index++) {
			const width = ticksToBeats(items[index].durationTicks) * PIXELS_PER_BEAT
			if (clientX < cursor + width / 2) return index
			cursor += width
		}
		return items.length
	}

	const updateExternalDropPreview = (event: Event): void => {
		const detail = (event as CustomEvent<ChordDropDetailT>).detail
		if (isChordSnapshot(detail.data)) {
			setExternalChordDrag(detail.data)
			setExternalInsertIndex(getDropInsertIndex(detail.x))
			return
		}
		if (isProgressionItemDragData(detail.data)) {
			const dragData = detail.data
			setInternalDragId(dragData.itemId)
			setInternalInsertIndex(getDropInsertIndex(detail.x, dragData.itemId))
		}
	}

	const clearExternalDropPreview = (): void => {
		setExternalChordDrag(null)
		setExternalInsertIndex(null)
		setInternalDragId(null)
		setInternalInsertIndex(null)
	}

	const commitInternalReorder = (itemId: string, insertIndex: number): void => {
		const items = sortedItems()
		const source = items.find((item) => item._id === itemId)
		if (source === undefined) {
			clearExternalDropPreview()
			return
		}
		const reordered = items.filter((item) => item._id !== itemId)
		const nextIndex = Math.min(reordered.length, Math.max(0, insertIndex))
		reordered.splice(nextIndex, 0, source)
		const orderedIds = reordered.map((item) => item._id)
		if (orderedIds.every((id, index) => id === items[index]?._id)) {
			clearExternalDropPreview()
			return
		}

		updateLocalItems(reordered)
		clearExternalDropPreview()
	}

	const handleExternalChordDrop = (event: Event): void => {
		const detail = (event as CustomEvent<ChordDropDetailT>).detail
		if (isProgressionItemDragData(detail.data)) return
		if (!isChordSnapshot(detail.data)) return

		const snapshot = detail.data
		const insertIndex = getDropInsertIndex(detail.x)
		const items = sortedItems()
		const nextIndex = Math.min(items.length, Math.max(0, insertIndex))
		const item: ProgressionChordItemT = {
			_id: makeLocalItemId(),
			order: nextIndex,
			type: 'chord',
			root: snapshot.root,
			qualityId: snapshot.qualityId,
			inversion: snapshot.inversion,
			durationTicks: Math.max(MIN_DURATION_TICKS, Math.round(snapshot.durationTicks)),
			octaveOffset: snapshot.octaveOffset,
			voicing: snapshot.voicing,
			velocityMode: snapshot.velocityMode,
			velocityMin: snapshot.velocityMin,
			velocityMax: snapshot.velocityMax
		}

		updateLocalItems([...items.slice(0, nextIndex), item, ...items.slice(nextIndex)])
		clearExternalDropPreview()
	}

	const renderInsertPreview = () => {
		const chordSnapshot = externalChordDrag()
		const draggedItem = activeInternalDragItem()
		const durationTicks = chordSnapshot?.durationTicks ?? draggedItem?.durationTicks
		const label =
			chordSnapshot?.label ??
			(draggedItem?.type === 'chord'
				? `${resolveChordRootName(draggedItem.root, props.projectKey, props.projectScale)}${getChordQualityLabel(draggedItem.qualityId)}`
				: draggedItem === null
					? ''
					: 'Rest')
		if (durationTicks === undefined) return null
		return (
			<div
				class="progressionInsertPreview"
				style={{
					width: `${ticksToBeats(durationTicks) * PIXELS_PER_BEAT}px`,
					order: String(externalInsertIndex() ?? internalInsertIndex() ?? 0)
				}}
			>
				<span>{label}</span>
			</div>
		)
	}

	const handleMouseUp = (event: MouseEvent) => {
		const resize = resizeState()
		if (resize !== null) {
			const item = props.items.find((c) => c._id === resize.id)
			if (item) {
				updateItemDuration(item, getResizeDurationTicks(resize, event.clientX))
			}
			if (item !== undefined) stopItemPreview(item)
			setResizeState(null)
			return
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
		if (playheadTicks === null || playheadTicks === undefined || laneRef === undefined) return
		const left = playheadLeft()
		const start = laneRef.scrollLeft
		const end = start + laneRef.clientWidth
		if (left < start + 32 || left > end - 80) {
			laneRef.scrollTo({ left: Math.max(0, left - laneRef.clientWidth / 2), behavior: 'smooth' })
		}
	})

	return (
		<z-column class="progressionBar">
			<z-row class="progressionBarHeader">
				<span class="progressionBarLabel">Progression</span>
				<div class="progressionMidiButtons">
					<button
						type="button"
						class="progressionMidiButton"
						title="Download progression MIDI"
						aria-label="Download progression MIDI"
						disabled={props.isProgressionMidiDisabled}
						onClick={() => props.onDownloadProgressionMidi()}
					>
						<DownloadIcon />
					</button>
					<button
						type="button"
						class="progressionMidiButton"
						title="Download performance MIDI"
						aria-label="Download performance MIDI"
						disabled={props.isPerformanceMidiDisabled}
						onClick={() => props.onDownloadPerformanceMidi()}
					>
						<DownloadIcon />
					</button>
				</div>
			</z-row>

			<z-drop-target
				class="progressionDropTarget"
				accept={`${CHORD_CARD_DRAG_TYPE} ${PROGRESSION_ITEM_DRAG_TYPE}`}
				group={CHORD_CARD_DRAG_GROUP}
				on:dragenter={updateExternalDropPreview}
				on:dragover={updateExternalDropPreview}
				on:dragleave={clearExternalDropPreview}
				on:dropitem={(event: Event) => handleExternalChordDrop(event)}
			>
				<z-column class="progressionLane" ref={laneRef}>
					<z-row class="progressionLaneContent" ref={laneContentRef}>
						<div class="progressionTimelineRuler" style={{ width: `${timelineWidth()}px` }}>
							<For each={timelineBeats()}>
								{(beat) => {
									const isBar = beat % BEATS_PER_BAR === 0
									const shouldLabelBar = isBar && beat < TIMELINE_BAR_COUNT * BEATS_PER_BAR
									return (
										<div
											class={`progressionTimelineMark${isBar ? ' isBar' : ''}`}
											style={{ left: `${beat * PIXELS_PER_BEAT}px` }}
										>
											<Show when={shouldLabelBar}>
												<span>{Math.floor(beat / BEATS_PER_BAR) + 1}</span>
											</Show>
										</div>
									)
								}}
							</For>
						</div>

						<Show when={props.items.length === 0 && !hasExternalChordPreview()}>
							<div class="progressionEmpty">Drop chords here to build a progression.</div>
						</Show>

						<Show when={props.playheadTicks !== null && props.playheadTicks !== undefined && props.items.length > 0}>
							<div class="progressionPlayhead" style={{ left: `${playheadLeft()}px` }} />
						</Show>

						<Show when={hasExternalChordPreview() || hasInternalItemPreview()}>{renderInsertPreview()}</Show>

						<For each={sortedItems()}>
							{(item, index) => {
								const width = () => ticksToBeats(item.durationTicks) * PIXELS_PER_BEAT
								const isSelected = () => selectedId() === item._id
								const isDraggingSource = () => internalDragId() === item._id
								const visualIndex = () => {
									const externalIndex = externalInsertIndex()
									const sourceId = internalDragId()
									const filteredItems = sortedItems().filter((candidate) => candidate._id !== sourceId)
									const baseIndex = filteredItems.findIndex((candidate) => candidate._id === item._id)
									if (sourceId === item._id) return index()
									const insertIndex = internalInsertIndex() ?? externalIndex
									if (insertIndex === null || baseIndex === -1) return index()
									return baseIndex >= insertIndex ? baseIndex + 1 : baseIndex
								}
								const label =
									item.type === 'chord'
										? `${resolveChordRootName(item.root, props.projectKey, props.projectScale)}${getChordQualityLabel(item.qualityId)}`
										: 'Rest'

								return (
									<>
										<z-context-menu
											items={itemMenuItems(item)}
											on:select={(event: Event) => handleItemMenuSelect(event, item)}
										>
											{renderItemModifierControls(item)}
											<z-draggable
												class={`progressionItemDraggable${isDraggingSource() ? ' isProgressionSourceDragging' : ''}`}
												style={{ order: String(visualIndex()) }}
												type={PROGRESSION_ITEM_DRAG_TYPE}
												group={CHORD_CARD_DRAG_GROUP}
												handle=".progressionChordBlockDragSurface"
												data={{ kind: 'progressionItem', itemId: item._id } satisfies ProgressionItemDragDataT}
												on:dragstart={() => {
													const sourceIndex = sortedItems()
														.filter((candidate) => candidate._id !== item._id)
														.findIndex((candidate) => candidate.order > item.order)
													setInternalDragId(item._id)
													setInternalInsertIndex(sourceIndex === -1 ? sortedItems().length - 1 : sourceIndex)
													stopItemPreview(item)
												}}
												on:dragend={() => {
													const insertIndex = internalInsertIndex()
													const itemId = internalDragId()
													stopItemPreview(item)
													if (itemId !== null && insertIndex !== null) {
														commitInternalReorder(itemId, insertIndex)
													} else {
														clearExternalDropPreview()
													}
												}}
											>
												<div
													class={`progressionChordBlock${isSelected() ? ' isSelected' : ''}${item.isEnabled === false ? ' isDisabled' : ''}${hasItemModifiers(item) ? ' hasModifiers' : ''}${resizeState()?.id === item._id ? ' isResizing' : ''}`}
													data-item-id={item._id}
													style={{
														width: `${width()}px`
													}}
													onMouseUp={() => stopItemPreview(item)}
													onMouseLeave={() => stopItemPreview(item)}
												>
													<div
														class="chordBlockResizeHandle left"
														onMouseDown={(event) => handleResizeMouseDown(item, 'left', event)}
													/>
													<div
														class="progressionChordBlockDragSurface"
														onMouseDown={(event) => handleMouseDownOnBlock(item, event)}
													>
														<span class="chordBlockLabel">{label}</span>
														<span class="chordBlockDuration">
															{item.isEnabled === false ? 'Disabled' : `${ticksToBeats(item.durationTicks)}b`}
														</span>
													</div>
													<span class="chordBlockModifierIndicator" title="Modified" />
													<div
														class="chordBlockResizeHandle right"
														onMouseDown={(event) => handleResizeMouseDown(item, 'right', event)}
													/>
												</div>
											</z-draggable>
										</z-context-menu>
									</>
								)
							}}
						</For>
					</z-row>
				</z-column>
			</z-drop-target>
		</z-column>
	)
}
