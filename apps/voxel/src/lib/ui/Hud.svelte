<script lang="ts">
	import GalleryHud from './gallery/GalleryHud.svelte'
	import NewProjectDialog from './gallery/NewProjectDialog.svelte'
	import ProjectMenuDialog from './gallery/ProjectMenuDialog.svelte'
	import RenameProjectDialog from './gallery/RenameProjectDialog.svelte'
	import DeleteProjectDialog from './gallery/DeleteProjectDialog.svelte'
	import ExportDialog from './gallery/ExportDialog.svelte'
	import WorkspaceHud from './workspace/WorkspaceHud.svelte'
	import KeymapDialog from './shared/KeymapDialog.svelte'
	import FlyPrompt from './shared/FlyPrompt.svelte'
	import Crosshair from './shared/Crosshair.svelte'
	import Toasts from './shared/Toasts.svelte'
	import { editor } from '../state/editor.svelte'
	import { gallery } from '../state/gallery.svelte'
	import { ui } from '../state/ui.svelte'
	import './Hud.css'

	const workspaceMeta = $derived(ui.route === 'workspace' ? editor.meta : null)
	const isGallery = $derived(ui.route === 'gallery')
	const isGalleryPromptVisible = $derived(isGallery && gallery.isLoaded && !ui.isPointerLocked && ui.overlay === 'none')
	const isGalleryCrosshairVisible = $derived(isGallery && ui.isPointerLocked)
</script>

<div class="hud">
	{#if workspaceMeta}
		<WorkspaceHud meta={workspaceMeta} />
	{:else}
		<GalleryHud />
		{#if isGalleryCrosshairVisible}
			<Crosshair />
		{/if}
		{#if isGalleryPromptVisible}
			<FlyPrompt heading="Your gallery" />
		{/if}
	{/if}
	<Toasts />
</div>

<NewProjectDialog />
<ProjectMenuDialog />
<RenameProjectDialog />
<DeleteProjectDialog />
<ExportDialog />
<KeymapDialog />
