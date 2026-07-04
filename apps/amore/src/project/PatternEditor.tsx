import { createSignal, createEffect, onCleanup, For } from 'solid-js'
import { convexClient } from '@amore/convex/client'
import { api } from '@convex/_generated/api'
import { beatsToTicks, snapTicksToGrid, ticksToBeats } from '@amore/music/timing'
import type { PatternSignalT } from '@amore/music/types'

type PatternEditorPropsT = {
	patternId: string
	patternLengthTicks: number
	gridTicks: number
	signals: PatternSignalT[]
}

const PIXELS_PER_BEAT = 80
const ROW_HEIGHT = 40
const TOTAL_NOTE_ROWS = 8
const MIN_DURATION_TICKS = 60
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

type ResizeStateT = { id: string; side: 'left' | 'right'; startX: number; initialDurationTicks: number; initialStartTicks: number } | null
type DragStateT = { id: string; startX: number; startY: number; initialStartTicks: number; initialNoteIndex: number } | null

export const PatternEditor = (props: PatternEditorPropsT) => {
	const [selectedId, setSelectedId] = createSignal<string | null>(null)
	const [resizeState, setResizeState] = createSignal<ResizeStateT>(null)
	const [dragState, setDragState] = createSignal<DragStateT>(null)
	let gridRef: HTMLDivElement | undefined

	const patternLengthBeats = () => ticksToBeats(props.patternLengthTicks)
	const patternWidth = () => patternLengthBeats() * PIXELS_PER_BEAT

	const getGridOffset = (): { left: number; top: number } => {
		const rect = gridRef?.getBoundingClientRect()
		return { left: rect?.left ?? 0, top: rect?.top ?? 0 }
	}

	const beatFromX = (clientX: number): number => {
		const offset = getGridOffset()
		const x = clientX - offset.left
		return Math.max(0, Math.min(patternLengthBeats(), x / PIXELS_PER_BEAT))
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
		void convexClient.mutation(api.patterns.removeSignal, { id: id as any })
	}

	createEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		onCleanup(() => document.removeEventListener('keydown', handleKeyDown))
	})

	const handleGridMouseDown = async (event: MouseEvent) => {
		if (event.target !== gridRef && !((event.target as HTMLElement).classList.contains('signalEditorRow') || (event.target as HTMLElement).classList.contains('signalEditorBeat'))) return
		const startTicks = snapTicksToGrid(beatsToTicks(beatFromX(event.clientX)), props.gridTicks)
		const rowIndex = rowIndexFromY(event.clientY)
		const noteIndex = NOTE_INDEX_FOR_ROW(rowIndex)
		await convexClient.mutation(api.patterns.addSignal, {
			patternId: props.patternId as any,
			chordToneIndex: noteIndex,
			octaveModifier: 0,
			startTicks,
			durationTicks: beatsToTicks(0.5),
			velocity: 100
		})
	}

	const handleSignalMouseDown = (signal: PatternSignalT, event: MouseEvent) => {
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
			const deltaTicks = beatsToTicks(deltaX / PIXELS_PER_BEAT)
			let newStartTicks = resize.initialStartTicks
			let newDurationTicks = resize.initialDurationTicks
			if (resize.side === 'right') {
				newDurationTicks = Math.max(MIN_DURATION_TICKS, resize.initialDurationTicks + deltaTicks)
			} else {
				const startDeltaTicks = Math.min(deltaTicks, resize.initialDurationTicks - MIN_DURATION_TICKS)
				newStartTicks = Math.max(0, resize.initialStartTicks + startDeltaTicks)
				newDurationTicks = Math.max(MIN_DURATION_TICKS, resize.initialDurationTicks - startDeltaTicks)
			}
			await convexClient.mutation(api.patterns.updateSignal, {
				id: resize.id as any,
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
			const maxStartTicks = Math.max(0, props.patternLengthTicks - MIN_DURATION_TICKS)
			const newStartTicks = Math.max(0, Math.min(maxStartTicks, drag.initialStartTicks + deltaTicks))
			const newNoteIndex = Math.max(1, Math.min(TOTAL_NOTE_ROWS, drag.initialNoteIndex - deltaRow))
			await convexClient.mutation(api.patterns.updateSignal, {
				id: drag.id as any,
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
								const rowSignals = () => props.signals.filter((s) => s.chordToneIndex === noteIndex)

								return (
									<div class="signalEditorRow">
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
												const color = SIGNAL_COLORS[(signal.chordToneIndex - 1) % SIGNAL_COLORS.length]
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
														<span>N{signal.chordToneIndex}</span>
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
