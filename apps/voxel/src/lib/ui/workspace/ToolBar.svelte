<script lang="ts">
	import EraserIcon from 'phosphor-svelte/lib/EraserIcon'
	import KeyCombo from '../shared/KeyCombo.svelte'
	import { TOOL_ICONS } from '../icons'
	import { TOOLS, findTool } from '../../state/tools'
	import type { ToolIdT } from '../../state/tools'
	import { setTool } from '../../state/controls'
	import { editor } from '../../state/editor.svelte'
	import { keymap } from '../../state/keymap.svelte'
	import './ToolBar.css'

	const activeTool = $derived(findTool(editor.tool))
	const toolHint = $derived(editor.isDeleteMode ? activeTool.deleteHint : activeTool.hint)
	const deleteClass = $derived(editor.isDeleteMode ? 'tool-button isDelete isActive' : 'tool-button isDelete')

	const getToolClass = (toolId: ToolIdT): string => {
		const isActive = toolId === editor.tool
		if (isActive) return 'tool-button isActive'
		return 'tool-button'
	}

	const toggleDelete = (): void => {
		editor.isDeleteMode = !editor.isDeleteMode
	}
</script>

<div class="tool-bar-wrap">
	<z-text size="xs" color="muted">{toolHint}</z-text>
	<nav class="tool-bar" aria-label="Tools">
		{#each TOOLS as tool (tool.id)}
			{@const ToolIcon = TOOL_ICONS[tool.id]}
			<button type="button" class={getToolClass(tool.id)} onclick={() => setTool(tool.id)} title={tool.name} aria-pressed={tool.id === editor.tool}>
				<ToolIcon size={18} weight="bold" />
				<span class="tool-button-key"><KeyCombo combo={keymap[tool.actionId]} size="xs" /></span>
			</button>
			{#if tool.id === 'stamp'}
				<span class="tool-bar-divider"></span>
			{/if}
		{/each}
		<span class="tool-bar-divider"></span>
		<button type="button" class={deleteClass} onclick={toggleDelete} title="Delete mode" aria-pressed={editor.isDeleteMode}>
			<EraserIcon size={18} weight="bold" />
			<span class="tool-button-key"><KeyCombo combo={keymap.toggleDelete} size="xs" /></span>
		</button>
	</nav>
</div>
