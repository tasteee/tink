import { createSignal, createEffect, onCleanup, For, Show } from 'solid-js'
import { convexClient } from '@amore/convex/client'
import { api } from '@convex/_generated/api'
import { getChordQualityLabel, resolveChordRootName } from '@amore/music/theory'
import { beatsToTicks, ticksToBeats } from '@amore/music/timing'
import type { ChordVoicingT, ProgressionChordItemT, ProgressionItemT, ScaleTypeT } from '@amore/music/types'

type ProgressionBarPropsT = {
	items: ProgressionItemT[]
	progressionId: string
	projectKey: string
	projectScale: ScaleTypeT
}

const PIXELS_PER_BEAT = 80
const MIN_DURATION_TICKS = 120
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

type ResizeStateT = { id: string; side: 'left' | 'right'; startX: number; initialDurationTicks: number } | null
type DragStateT = { id: string; startX: number; insertIndex: number } | null

type ChordModifierStateT = {
	inversion: number
	voicing: ChordVoicingT
	octaveOffset: number
	velocityMin: number
	velocityMax: number
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

export const ProgressionBar = (props: ProgressionBarPropsT) => {
	const [selectedId, setSelectedId] = createSignal<string | null>(null)
	const [resizeState, setResizeState] = createSignal<ResizeStateT>(null)
	const [dragState, setDragState] = createSignal<DragStateT>(null)
	const [dragInsertIndex, setDragInsertIndex] = createSignal<number | null>(null)

	const sortedItems = () => [...props.items].sort((a, b) => a.order - b.order)

	const modifiersForItem = (item: ProgressionChordItemT): ChordModifierStateT => ({
		inversion: item.inversion ?? DEFAULT_INVERSION,
		voicing: item.voicing ?? DEFAULT_VOICING,
		octaveOffset: item.octaveOffset ?? DEFAULT_OCTAVE_OFFSET,
		velocityMin: item.velocityMin ?? DEFAULT_VELOCITY_MIN,
		velocityMax: item.velocityMax ?? DEFAULT_VELOCITY_MAX
	})

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
			{ value: 'inversion.down', label: 'Inversion -', shortcut: String(modifiers.inversion) },
			{ value: 'inversion.up', label: 'Inversion +' },
			{ value: 'octave.down', label: 'Octave -', shortcut: modifiers.octaveOffset >= 0 ? `+${modifiers.octaveOffset}` : String(modifiers.octaveOffset) },
			{ value: 'octave.up', label: 'Octave +' },
			{ isSeparator: true },
			...VOICING_OPTIONS.map((option) => ({
				value: `voicing.${option}`,
				label: `Voicing: ${VOICING_LABELS[option]}`,
				shortcut: modifiers.voicing === option ? 'Current' : undefined
			})),
			{ isSeparator: true },
			{ value: 'velocity.min.down', label: 'Velocity min -5', shortcut: String(modifiers.velocityMin) },
			{ value: 'velocity.min.up', label: 'Velocity min +5' },
			{ value: 'velocity.max.down', label: 'Velocity max -5', shortcut: String(modifiers.velocityMax) },
			{ value: 'velocity.max.up', label: 'Velocity max +5' },
			{ isSeparator: true },
			{ value: 'reset', label: 'Reset modifiers', isDisabled: !hasItemModifiers(item) },
			{ value: 'remove', label: 'Remove', isDanger: true }
		]
	}

	const updateItemModifiers = async (item: ProgressionChordItemT, modifiers: ChordModifierStateT): Promise<void> => {
		await convexClient.mutation(api.progression.updateChordModifiers, {
			id: item._id as any,
			inversion: modifiers.inversion,
			octaveOffset: modifiers.octaveOffset,
			voicing: modifiers.voicing,
			velocityMin: modifiers.velocityMin,
			velocityMax: modifiers.velocityMax
		})
	}

	const handleItemMenuSelect = async (event: Event, item: ProgressionItemT): Promise<void> => {
		const value = (event as CustomEvent<{ value: string }>).detail.value

		if (value === 'duplicate') {
			await convexClient.mutation(api.progression.duplicateItem, { id: item._id as any })
			return
		}
		if (value === 'remove') {
			setSelectedId(null)
			await convexClient.mutation(api.progression.removeItem, { id: item._id as any })
			return
		}
		if (value === 'duration.up' || value === 'duration.down') {
			const delta = value === 'duration.up' ? BEAT_INCREMENT_TICKS : -BEAT_INCREMENT_TICKS
			await convexClient.mutation(api.progression.updateDuration, {
				id: item._id as any,
				durationTicks: Math.max(MIN_DURATION_TICKS, item.durationTicks + delta)
			})
			return
		}
		if (item.type !== 'chord') return

		const modifiers = modifiersForItem(item)
		if (value === 'toggle.enabled') {
			await convexClient.mutation(api.progression.updateChordModifiers, {
				id: item._id as any,
				isEnabled: item.isEnabled === false
			})
			return
		}
		if (value === 'reset') {
			await updateItemModifiers(item, {
				inversion: DEFAULT_INVERSION,
				voicing: DEFAULT_VOICING,
				octaveOffset: DEFAULT_OCTAVE_OFFSET,
				velocityMin: DEFAULT_VELOCITY_MIN,
				velocityMax: DEFAULT_VELOCITY_MAX
			})
			return
		}
		if (value === 'inversion.down') await updateItemModifiers(item, { ...modifiers, inversion: clamp(modifiers.inversion - 1, 0, 8) })
		if (value === 'inversion.up') await updateItemModifiers(item, { ...modifiers, inversion: clamp(modifiers.inversion + 1, 0, 8) })
		if (value === 'octave.down') await updateItemModifiers(item, { ...modifiers, octaveOffset: clamp(modifiers.octaveOffset - 1, -3, 3) })
		if (value === 'octave.up') await updateItemModifiers(item, { ...modifiers, octaveOffset: clamp(modifiers.octaveOffset + 1, -3, 3) })
		if (value === 'velocity.min.down') await updateItemModifiers(item, { ...modifiers, velocityMin: clamp(modifiers.velocityMin - 5, 1, modifiers.velocityMax - 1) })
		if (value === 'velocity.min.up') await updateItemModifiers(item, { ...modifiers, velocityMin: clamp(modifiers.velocityMin + 5, 1, modifiers.velocityMax - 1) })
		if (value === 'velocity.max.down') await updateItemModifiers(item, { ...modifiers, velocityMax: clamp(modifiers.velocityMax - 5, modifiers.velocityMin + 1, 127) })
		if (value === 'velocity.max.up') await updateItemModifiers(item, { ...modifiers, velocityMax: clamp(modifiers.velocityMax + 5, modifiers.velocityMin + 1, 127) })
		if (value.startsWith('voicing.')) await updateItemModifiers(item, { ...modifiers, voicing: value.replace('voicing.', '') as ChordVoicingT })
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		const id = selectedId()
		if (id === null) return
		if (event.key !== 'Backspace' && event.key !== 'Delete') return
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
		event.preventDefault()
		setSelectedId(null)
		void convexClient.mutation(api.progression.removeItem, { id: id as any })
	}

	createEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		onCleanup(() => document.removeEventListener('keydown', handleKeyDown))
	})

	const handleMouseDownOnBlock = (item: ProgressionItemT, event: MouseEvent) => {
		if (event.button !== 0) return
		event.stopPropagation()
		const target = event.currentTarget as HTMLElement
		const rect = target.getBoundingClientRect()
		const offsetX = event.clientX - rect.left

		const isLeftEdge = offsetX < RESIZE_EDGE_WIDTH
		const isRightEdge = offsetX > rect.width - RESIZE_EDGE_WIDTH

		if (isLeftEdge || isRightEdge) {
			setResizeState({
				id: item._id,
				side: isLeftEdge ? 'left' : 'right',
				startX: event.clientX,
				initialDurationTicks: item.durationTicks
			})
			return
		}

		setSelectedId(item._id)
		const items = sortedItems()
		const index = items.findIndex((c) => c._id === item._id)
		setDragState({ id: item._id, startX: event.clientX, insertIndex: index })
	}

	const handleMouseMove = (event: MouseEvent) => {
		const resize = resizeState()
		if (resize !== null) {
			const deltaX = event.clientX - resize.startX
			const deltaTicks = beatsToTicks(deltaX / PIXELS_PER_BEAT)
			const newDurationTicks = Math.max(
				MIN_DURATION_TICKS,
				resize.initialDurationTicks + (resize.side === 'right' ? deltaTicks : -deltaTicks)
			)
			const item = props.items.find((c) => c._id === resize.id)
			if (item) {
				// Optimistic local display handled by Convex subscription; just track cursor
			}
			return
		}

		const drag = dragState()
		if (drag !== null) {
			const deltaX = event.clientX - drag.startX
			const items = sortedItems()
			const originalIndex = items.findIndex((c) => c._id === drag.id)
			let cumX = 0
			let newIndex = originalIndex
			for (let i = 0; i < items.length; i++) {
				const midX = cumX + (ticksToBeats(items[i].durationTicks) * PIXELS_PER_BEAT) / 2
				if (drag.startX - laneOffsetX() + deltaX > midX) newIndex = i
				cumX += ticksToBeats(items[i].durationTicks) * PIXELS_PER_BEAT
			}
			setDragInsertIndex(newIndex)
		}
	}

	let laneRef: HTMLDivElement | undefined
	const laneOffsetX = () => laneRef?.getBoundingClientRect().left ?? 0

	const handleMouseUp = async (event: MouseEvent) => {
		const resize = resizeState()
		if (resize !== null) {
			const item = props.items.find((c) => c._id === resize.id)
			if (item) {
				const deltaX = event.clientX - resize.startX
				const deltaTicks = beatsToTicks(deltaX / PIXELS_PER_BEAT)
				const newDurationTicks = Math.max(
					MIN_DURATION_TICKS,
					resize.initialDurationTicks + (resize.side === 'right' ? deltaTicks : -deltaTicks)
				)
				await convexClient.mutation(api.progression.updateDuration, {
					id: resize.id as any,
					durationTicks: newDurationTicks
				})
			}
			setResizeState(null)
			return
		}

		const drag = dragState()
		if (drag !== null) {
			const insertIndex = dragInsertIndex()
			if (insertIndex !== null) {
				const items = sortedItems()
				const originalIndex = items.findIndex((c) => c._id === drag.id)
				if (insertIndex !== originalIndex) {
					const reordered = [...items]
					const [moved] = reordered.splice(originalIndex, 1)
					reordered.splice(insertIndex, 0, moved)
					await convexClient.mutation(api.progression.reorderItems, {
						progressionId: props.progressionId as any,
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
				<Show when={props.items.length === 0}>
					<div class="progressionEmpty">Add chords from the grid above to build a progression.</div>
				</Show>

				<For each={sortedItems()}>
					{(item, index) => {
						const width = () => ticksToBeats(item.durationTicks) * PIXELS_PER_BEAT
						const isSelected = () => selectedId() === item._id
						const color = CHORD_COLORS[index() % CHORD_COLORS.length]
						const label =
							item.type === 'chord'
								? `${resolveChordRootName(item.root, props.projectKey, props.projectScale)}${getChordQualityLabel(item.qualityId)}`
								: 'Rest'

						return (
							<z-context-menu items={itemMenuItems(item)} on:select={(event: Event) => void handleItemMenuSelect(event, item)}>
								<div
									class={`progressionChordBlock${isSelected() ? ' isSelected' : ''}${item.isEnabled === false ? ' isDisabled' : ''}${hasItemModifiers(item) ? ' hasModifiers' : ''}`}
									style={{
										width: `${width()}px`,
										background: color
									}}
									onMouseDown={(event) => handleMouseDownOnBlock(item, event)}
								>
									<div class="chordBlockResizeHandle left" />
									<span class="chordBlockLabel">{label}</span>
									<span class="chordBlockDuration">{item.isEnabled === false ? 'Disabled' : `${ticksToBeats(item.durationTicks)}b`}</span>
									<span class="chordBlockModifierIndicator" title="Modified" />
									<div class="chordBlockResizeHandle right" />
								</div>
							</z-context-menu>
						)
					}}
				</For>
			</div>
		</div>
	)
}
