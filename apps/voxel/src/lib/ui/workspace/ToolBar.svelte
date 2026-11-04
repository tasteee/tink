<script lang="ts">
	import KeyCombo from '../shared/KeyCombo.svelte'
	import { TOOL_ICONS } from '../icons'
	import { TOOL_ACTIONS, TOOL_SHAPES, checkActionTakesShape, checkIsShapeAllowed, getToolHint } from '../../state/tools'
	import type { ToolActionIdT, ToolShapeIdT } from '../../state/tools'
	import { setAction, setShape } from '../../state/controls'
	import { editor } from '../../state/editor.svelte'
	import { keymap } from '../../state/keymap.svelte'
	import './ToolBar.css'

	// Actions (1-5) say what happens. Shapes (6-0) say which
	// voxels it touches. Object and pivot are group modes.
	const voxelActions = TOOL_ACTIONS.filter((action) => action.takesShape || action.id === 'extrude')
	const groupActions = TOOL_ACTIONS.filter((action) => action.id === 'object' || action.id === 'pivot')

	const toolHint = $derived(getToolHint(editor.action, editor.shape))
	const doesActionTakeShape = $derived(checkActionTakesShape(editor.action))

	const getActionClass = (actionId: ToolActionIdT): string => {
		const classes = ['tool-button']
		const isActive = actionId === editor.action
		if (isActive) classes.push('isActive')
		const isEraseActive = isActive && actionId === 'erase'
		if (isEraseActive) classes.push('isErase')
		return classes.join(' ')
	}

	const getShapeClass = (shapeId: ToolShapeIdT): string => {
		const classes = ['tool-button']
		const isActive = doesActionTakeShape && shapeId === editor.shape
		if (isActive) classes.push('isActive')
		const isUnavailable = !doesActionTakeShape || !checkIsShapeAllowed(editor.action, shapeId)
		if (isUnavailable) classes.push('isDimmed')
		return classes.join(' ')
	}
</script>

<div class="tool-bar-wrap">
	<span class="tool-hint">
		<z-text size="xs" color="muted">{toolHint}</z-text>
	</span>
	<nav class="tool-bar" aria-label="Tools">
		{#each voxelActions as action (action.id)}
			{@const ActionIcon = TOOL_ICONS[action.id]}
			<button type="button" class={getActionClass(action.id)} onclick={() => setAction(action.id)} title={action.name} aria-pressed={action.id === editor.action}>
				<ActionIcon size={18} weight="bold" />
				<span class="tool-button-key"><KeyCombo combo={keymap[action.keyActionId]} size="xs" /></span>
			</button>
		{/each}
		<span class="tool-bar-divider"></span>
		{#each TOOL_SHAPES as shape (shape.id)}
			{@const ShapeIcon = TOOL_ICONS[shape.id]}
			<button type="button" class={getShapeClass(shape.id)} onclick={() => setShape(shape.id)} title={shape.name} aria-pressed={doesActionTakeShape && shape.id === editor.shape}>
				<ShapeIcon size={18} weight="bold" />
				<span class="tool-button-key"><KeyCombo combo={keymap[shape.keyActionId]} size="xs" /></span>
			</button>
		{/each}
		<span class="tool-bar-divider"></span>
		{#each groupActions as action (action.id)}
			{@const ActionIcon = TOOL_ICONS[action.id]}
			<button type="button" class={getActionClass(action.id)} onclick={() => setAction(action.id)} title={action.name} aria-pressed={action.id === editor.action}>
				<ActionIcon size={18} weight="bold" />
				<span class="tool-button-key"><KeyCombo combo={keymap[action.keyActionId]} size="xs" /></span>
			</button>
		{/each}
	</nav>
</div>
