import { createSignal, createEffect, onCleanup, For } from 'solid-js'
import { convexClient } from '@amore/convex/client'
import { api } from '@convex/_generated/api'
import type { SignalT } from '@amore/music/types'

type PatternEditorPropsT = {
	projectId: string
	patternLengthBeats: number
	signals: SignalT[]
}

const PIXELS_PER_BEAT = 80
const ROW_HEIGHT = 40
const TOTAL_NOTE_ROWS = 8
const MIN_DURATION_BEATS = 0.125
const RESIZE_EDGE_WIDTH = 8

const NOTE_LABELS = Array.from({ length: TOTAL_NOTE_ROWS }, (_, i) => `N${TOTAL_NOTE_ROWS - i}`)
const NOTE_INDEX_FOR_ROW = (rowIndex: number): number => TOTAL_NOTE_ROWS - rowIndex

const SIGNAL_COLORS = [
	'oklch(0.52 0.22 270)',
	'oklch(0.52 0.22 200)',
	'oklch(0.52 0.22 160)',
	'oklch(0.52 0.22 60)',
	'oklch(0.52 0.22 300)',
	'oklch(0.52 0.22 30)',
	'oklch(0.52 0.22 340)'
]

type ResizeStateT = { id: string; side: 'left' | 'right'; startX: number; initialDuration: number; initialStart: number } | null
type DragStateT = { id: string; startX: number; startY: number; initialStartBeat: number; initialNoteIndex: number } | null

export const PatternEditor = (props: PatternEditorPropsT) => {
	const [selectedId, setSelectedId] = createSignal<string | null>(null)
	const [resizeState, setResizeState] = createSignal<ResizeStateT>(null)
	const [dragState, setDragState] = createSignal<DragStateT>(null)
	let gridRef: HTMLDivElement | undefined

	const patternWidth = () => props.patternLengthBeats * PIXELS_PER_BEAT

	const getGridOffset = (): { left: number; top: number } => {
		const rect = gridRef?.getBoundingClientRect()
		return { left: rect?.left ?? 0, top: rect?.top ?? 0 }
	}

	const beatFromX = (clientX: number): number => {
		const offset = getGridOffset()
		const x = clientX - offset.left
		return Math.max(0, Math.min(props.patternLengthBeats, x / PIXELS_PER_BEAT))
	}

	const rowIndexFromY = (clientY: number): number => {
		const offset = getGridOffset()
		const y = clientY - offset.top
		return Math.max(0, Math.min(TOTAL_NOTE_ROWS - 1, Math.floor(y / ROW_HEIGHT)))
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		const id = selectedId()
		if (id === null) return
		if (event.key !== 'Backspace' && event.key !== 'Delete') return
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
		event.preventDefault()
		setSelectedId(null)
		void convexClient.mutation(api.amoreSignals.remove, { id: id as any })
	}

	createEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		onCleanup(() => document.removeEventListener('keydown', handleKeyDown))
	})

	const handleGridMouseDown = async (event: MouseEvent) => {
		if (event.target !== gridRef && !((event.target as HTMLElement).classList.contains('signalEditorRow') || (event.target as HTMLElement).classList.contains('signalEditorBeat'))) return
		const startBeat = Math.floor(beatFromX(event.clientX) * 4) / 4
		const rowIndex = rowIndexFromY(event.clientY)
		const noteIndex = NOTE_INDEX_FOR_ROW(rowIndex)
		await convexClient.mutation(api.amoreSignals.add, {
			projectId: props.projectId as any,
			noteIndex,
			octaveModifier: 0,
			startBeat,
			durationBeats: 0.5,
			velocity: 100
		})
	}

	const handleSignalMouseDown = (signal: SignalT, event: MouseEvent) => {
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
				initialDuration: signal.durationBeats,
				initialStart: signal.startBeat
			})
			return
		}

		setDragState({
			id: signal._id,
			startX: event.clientX,
			startY: event.clientY,
			initialStartBeat: signal.startBeat,
			initialNoteIndex: signal.noteIndex
		})
	}

	const handleMouseMove = (event: MouseEvent) => {
		const resize = resizeState()
		if (resize !== null) {
			// Visual feedback handled by Convex subscription after mouseup commit
			return
		}
		// Drag visual feedback is similarly deferred to mouseup
	}

	const handleMouseUp = async (event: MouseEvent) => {
		const resize = resizeState()
		if (resize !== null) {
			const deltaX = event.clientX - resize.startX
			const deltaBeat = deltaX / PIXELS_PER_BEAT
			let newStart = resize.initialStart
			let newDuration = resize.initialDuration
			if (resize.side === 'right') {
				newDuration = Math.max(MIN_DURATION_BEATS, resize.initialDuration + deltaBeat)
			} else {
				const startDelta = Math.min(deltaBeat, resize.initialDuration - MIN_DURATION_BEATS)
				newStart = Math.max(0, resize.initialStart + startDelta)
				newDuration = Math.max(MIN_DURATION_BEATS, resize.initialDuration - startDelta)
			}
			await convexClient.mutation(api.amoreSignals.update, {
				id: resize.id as any,
				startBeat: newStart,
				durationBeats: newDuration
			})
			setResizeState(null)
			return
		}

		const drag = dragState()
		if (drag !== null) {
			const deltaX = event.clientX - drag.startX
			const deltaY = event.clientY - drag.startY
			const deltaBeat = deltaX / PIXELS_PER_BEAT
			const deltaRow = Math.round(deltaY / ROW_HEIGHT)
			const newStart = Math.max(0, Math.min(props.patternLengthBeats - MIN_DURATION_BEATS, drag.initialStartBeat + deltaBeat))
			const newNoteIndex = Math.max(1, Math.min(TOTAL_NOTE_ROWS, drag.initialNoteIndex - deltaRow))
			await convexClient.mutation(api.amoreSignals.update, {
				id: drag.id as any,
				startBeat: newStart,
				noteIndex: newNoteIndex
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

	return (
		<div class="signalEditor">
			<div class="signalEditorControls">
				<z-text size="sm" color="muted">
					Click the grid to add signals · Drag to move · Drag edges to resize · Backspace to delete
				</z-text>
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
						<For each={NOTE_LABELS}>
							{(_, rowIndex) => {
								const noteIndex = NOTE_INDEX_FOR_ROW(rowIndex())
								const rowSignals = () => props.signals.filter((s) => s.noteIndex === noteIndex)

								return (
									<div class="signalEditorRow">
										<For each={Array.from({ length: props.patternLengthBeats * 2 })}>
											{() => (
												<div
													class="signalEditorBeat"
													style={{ width: `${PIXELS_PER_BEAT / 2}px` }}
												/>
											)}
										</For>

										<For each={rowSignals()}>
											{(signal) => {
												const left = () => signal.startBeat * PIXELS_PER_BEAT
												const width = () => signal.durationBeats * PIXELS_PER_BEAT
												const color = SIGNAL_COLORS[(signal.noteIndex - 1) % SIGNAL_COLORS.length]
												const isSelected = () => selectedId() === signal._id

												return (
													<div
														class={`signalBlock${isSelected() ? ' isSelected' : ''}`}
														style={{
															left: `${left()}px`,
															width: `${Math.max(8, width())}px`,
															background: color
														}}
														onMouseDown={(event) => handleSignalMouseDown(signal, event)}
													>
														<div class="signalBlockResizeHandle left" />
														<span>N{signal.noteIndex}</span>
														<div class="signalBlockResizeHandle right" />
													</div>
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
