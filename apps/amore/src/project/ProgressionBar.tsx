import { createSignal, createEffect, onCleanup, For, Show } from 'solid-js'
import { convexClient } from '@amore/convex/client'
import { api } from '@convex/_generated/api'
import type { ProgressionChordT } from '@amore/music/types'

type ProgressionBarPropsT = {
	chords: ProgressionChordT[]
	projectId: string
}

const PIXELS_PER_BEAT = 80
const MIN_DURATION_BEATS = 0.25

const CHORD_COLORS = [
	'oklch(0.48 0.22 270)',
	'oklch(0.48 0.22 300)',
	'oklch(0.48 0.22 200)',
	'oklch(0.48 0.22 160)',
	'oklch(0.48 0.22 60)',
	'oklch(0.48 0.22 30)',
	'oklch(0.48 0.22 340)'
]

const RESIZE_EDGE_WIDTH = 10

type ResizeStateT = { id: string; side: 'left' | 'right'; startX: number; initialDuration: number } | null
type DragStateT = { id: string; startX: number; insertIndex: number } | null

export const ProgressionBar = (props: ProgressionBarPropsT) => {
	const [selectedId, setSelectedId] = createSignal<string | null>(null)
	const [resizeState, setResizeState] = createSignal<ResizeStateT>(null)
	const [dragState, setDragState] = createSignal<DragStateT>(null)
	const [dragInsertIndex, setDragInsertIndex] = createSignal<number | null>(null)

	const sortedChords = () => [...props.chords].sort((a, b) => a.order - b.order)

	const handleKeyDown = (event: KeyboardEvent) => {
		const id = selectedId()
		if (id === null) return
		if (event.key !== 'Backspace' && event.key !== 'Delete') return
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
		event.preventDefault()
		setSelectedId(null)
		void convexClient.mutation(api.amoreProgression.remove, { id: id as any })
	}

	createEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		onCleanup(() => document.removeEventListener('keydown', handleKeyDown))
	})

	const handleMouseDownOnBlock = (chord: ProgressionChordT, event: MouseEvent) => {
		event.stopPropagation()
		const target = event.currentTarget as HTMLElement
		const rect = target.getBoundingClientRect()
		const offsetX = event.clientX - rect.left

		const isLeftEdge = offsetX < RESIZE_EDGE_WIDTH
		const isRightEdge = offsetX > rect.width - RESIZE_EDGE_WIDTH

		if (isLeftEdge || isRightEdge) {
			setResizeState({
				id: chord._id,
				side: isLeftEdge ? 'left' : 'right',
				startX: event.clientX,
				initialDuration: chord.durationBeats
			})
			return
		}

		setSelectedId(chord._id)
		const chords = sortedChords()
		const index = chords.findIndex((c) => c._id === chord._id)
		setDragState({ id: chord._id, startX: event.clientX, insertIndex: index })
	}

	const handleMouseMove = (event: MouseEvent) => {
		const resize = resizeState()
		if (resize !== null) {
			const deltaX = event.clientX - resize.startX
			const deltaBeat = deltaX / PIXELS_PER_BEAT
			const newDuration = Math.max(MIN_DURATION_BEATS, resize.initialDuration + (resize.side === 'right' ? deltaBeat : -deltaBeat))
			const chord = props.chords.find((c) => c._id === resize.id)
			if (chord) {
				// Optimistic local display handled by Convex subscription; just track cursor
			}
			return
		}

		const drag = dragState()
		if (drag !== null) {
			const deltaX = event.clientX - drag.startX
			const chords = sortedChords()
			const originalIndex = chords.findIndex((c) => c._id === drag.id)
			let cumX = 0
			let newIndex = originalIndex
			for (let i = 0; i < chords.length; i++) {
				const midX = cumX + (chords[i].durationBeats * PIXELS_PER_BEAT) / 2
				if (drag.startX - laneOffsetX() + deltaX > midX) newIndex = i
				cumX += chords[i].durationBeats * PIXELS_PER_BEAT
			}
			setDragInsertIndex(newIndex)
		}
	}

	let laneRef: HTMLDivElement | undefined
	const laneOffsetX = () => laneRef?.getBoundingClientRect().left ?? 0

	const handleMouseUp = async (event: MouseEvent) => {
		const resize = resizeState()
		if (resize !== null) {
			const chord = props.chords.find((c) => c._id === resize.id)
			if (chord) {
				const deltaX = event.clientX - resize.startX
				const deltaBeat = deltaX / PIXELS_PER_BEAT
				const newDuration = Math.max(MIN_DURATION_BEATS, resize.initialDuration + (resize.side === 'right' ? deltaBeat : -deltaBeat))
				await convexClient.mutation(api.amoreProgression.updateDuration, {
					id: resize.id as any,
					durationBeats: newDuration
				})
			}
			setResizeState(null)
			return
		}

		const drag = dragState()
		if (drag !== null) {
			const insertIndex = dragInsertIndex()
			if (insertIndex !== null) {
				const chords = sortedChords()
				const originalIndex = chords.findIndex((c) => c._id === drag.id)
				if (insertIndex !== originalIndex) {
					const reordered = [...chords]
					const [moved] = reordered.splice(originalIndex, 1)
					reordered.splice(insertIndex, 0, moved)
					await convexClient.mutation(api.amoreProgression.reorder, {
						projectId: props.projectId as any,
						orderedIds: reordered.map((c) => c._id) as any[]
					})
				}
			}
			setDragState(null)
			setDragInsertIndex(null)
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
		<div class="progressionBar">
			<div class="progressionBarHeader">
				<span class="progressionBarLabel">Progression</span>
			</div>

			<div class="progressionLane" ref={laneRef}>
				<Show when={props.chords.length === 0}>
					<div class="progressionEmpty">Add chords from the grid above to build a progression.</div>
				</Show>

				<For each={sortedChords()}>
					{(chord, index) => {
						const width = () => chord.durationBeats * PIXELS_PER_BEAT
						const isSelected = () => selectedId() === chord._id
						const color = CHORD_COLORS[index() % CHORD_COLORS.length]
						const label = `${chord.root}${chord.chordType !== 'major' ? ' ' + chord.chordType : ''}`

						return (
							<div
								class={`progressionChordBlock${isSelected() ? ' isSelected' : ''}`}
								style={{
									width: `${width()}px`,
									background: color
								}}
								onMouseDown={(event) => handleMouseDownOnBlock(chord, event)}
							>
								<div class="chordBlockResizeHandle left" />
								<span class="chordBlockLabel">{label}</span>
								<span class="chordBlockDuration">{chord.durationBeats}b</span>
								<div class="chordBlockResizeHandle right" />
							</div>
						)
					}}
				</For>
			</div>
		</div>
	)
}
