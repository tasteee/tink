<script lang="ts">
	import { TOOL_ICONS } from '../icons'
	import { chooseWheelItem } from '../../state/controls'
	import { editor } from '../../state/editor.svelte'
	import { ui } from '../../state/ui.svelte'
	import { checkActionTakesShape } from '../../state/tools'
	import { WHEEL_ITEMS, getWheelIndex, getWheelItemPosition } from '../../state/wheel'
	import type { WheelItemT } from '../../state/wheel'
	import './ToolWheel.css'

	// Hold Tab, flick toward a tool, release. The flick is read
	// from mouse movement, so the pointer never leaves the view.
	const pickedIndex = $derived(getWheelIndex(ui.toolWheelX, ui.toolWheelY))
	const pickedLabel = $derived(pickedIndex >= 0 ? WHEEL_ITEMS[pickedIndex].label : 'Flick to a tool')

	const checkIsCurrentItem = (item: WheelItemT): boolean => {
		if (item.kind === 'action') return item.id === editor.action
		const isShape = item.kind === 'shape'
		const isShapeActive = checkActionTakesShape(editor.action)
		return isShape && isShapeActive && item.id === editor.shape
	}

	const getItemClass = (itemIndex: number): string => {
		const classes = ['tool-wheel-item']
		const isPicked = itemIndex === pickedIndex
		if (isPicked) classes.push('isPicked')
		const item = WHEEL_ITEMS[itemIndex]
		const isCurrent = checkIsCurrentItem(item)
		if (isCurrent) classes.push('isCurrent')
		return classes.join(' ')
	}

	const getItemX = (itemIndex: number): string => {
		return `${getWheelItemPosition(itemIndex)[0]}px`
	}

	const getItemY = (itemIndex: number): string => {
		return `${getWheelItemPosition(itemIndex)[1]}px`
	}

	const flickX = $derived(`${ui.toolWheelX}px`)
	const flickY = $derived(`${ui.toolWheelY}px`)
</script>

<div class="tool-wheel" role="menu" aria-label="Tool wheel">
	<div class="tool-wheel-ring"></div>
	<div class="tool-wheel-center">
		<z-text size="sm" weight={600}>{pickedLabel}</z-text>
	</div>
	<span class="tool-wheel-flick" style:--flick-x={flickX} style:--flick-y={flickY}></span>
	{#each WHEEL_ITEMS as item, itemIndex (item.id)}
		{@const ItemIcon = TOOL_ICONS[item.id]}
		<button type="button" role="menuitem" class={getItemClass(itemIndex)} style:--item-x={getItemX(itemIndex)} style:--item-y={getItemY(itemIndex)} onclick={() => chooseWheelItem(itemIndex)}>
			<ItemIcon size={20} weight="bold" />
			<span class="tool-wheel-label">{item.label}</span>
		</button>
	{/each}
</div>
