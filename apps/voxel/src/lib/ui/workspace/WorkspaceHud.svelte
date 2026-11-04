<script lang="ts">
	import TopBar from './TopBar.svelte'
	import ToolBar from './ToolBar.svelte'
	import StampPicker from './StampPicker.svelte'
	import SelectionBar from './SelectionBar.svelte'
	import ToolWheel from './ToolWheel.svelte'
	import ColorPanel from './ColorPanel.svelte'
	import ProjectColorsPanel from './ProjectColorsPanel.svelte'
	import GroupsPanel from './GroupsPanel.svelte'
	import AimMenuDialog from './AimMenuDialog.svelte'
	import GroupNameDialog from './GroupNameDialog.svelte'
	import ProjectSettingsDialog from './ProjectSettingsDialog.svelte'
	import Crosshair from '../shared/Crosshair.svelte'
	import ResumePrompt from '../shared/ResumePrompt.svelte'
	import { editor, selection } from '../../state/editor.svelte'
	import { ui } from '../../state/ui.svelte'
	import type { ProjectMetaT } from '../../model/types'
	import './WorkspaceHud.css'

	type WorkspaceHudPropsT = {
		meta: ProjectMetaT
	}

	let props: WorkspaceHudPropsT = $props()

	const isStampTool = $derived(editor.tool === 'stamp')
	const hasSelection = $derived(selection.size > 0)
	const isResumePromptVisible = $derived(!ui.isPointerLocked && ui.overlay === 'none')
	const isCrosshairVisible = $derived(ui.isPointerLocked && !ui.isToolWheelOpen)
	const hudClass = $derived(ui.isPointerLocked ? 'workspace-hud isFlying' : 'workspace-hud')
</script>

<div class={hudClass}>
	<div class="workspace-top">
		<TopBar meta={props.meta} />
	</div>

	<div class="workspace-left">
		{#if editor.isColorsOpen}
			<ColorPanel meta={props.meta} />
		{/if}
		{#if editor.isProjectColorsOpen}
			<ProjectColorsPanel meta={props.meta} />
		{/if}
	</div>

	<div class="workspace-right">
		{#if editor.isGroupsOpen}
			<GroupsPanel meta={props.meta} />
		{/if}
	</div>

	<div class="workspace-bottom">
		{#if hasSelection}
			<SelectionBar />
		{/if}
		{#if isStampTool}
			<StampPicker />
		{/if}
		<ToolBar />
	</div>

	{#if isCrosshairVisible}
		<Crosshair />
	{/if}
	{#if ui.isToolWheelOpen}
		<ToolWheel />
	{/if}
	{#if isResumePromptVisible}
		<ResumePrompt />
	{/if}
</div>

<AimMenuDialog meta={props.meta} />
<GroupNameDialog meta={props.meta} />
<ProjectSettingsDialog meta={props.meta} />
