<script lang="ts">
	import KeyboardIcon from 'phosphor-svelte/lib/KeyboardIcon'
	import UploadSimpleIcon from 'phosphor-svelte/lib/UploadSimpleIcon'
	import { gallery } from '../../state/gallery.svelte'
	import { importProjectFile } from '../../state/navigation'
	import { openOverlay } from '../../state/ui.svelte'
	import './GalleryHud.css'

	const projectCount = $derived(gallery.projects.length)
	const countLabel = $derived(projectCount === 1 ? '1 project' : `${projectCount} projects`)
	const isMoving = $derived(gallery.movingProjectId !== '')

	const openKeymap = (): void => {
		openOverlay('keymap')
	}
</script>

<header class="gallery-hud">
	<div class="gallery-brand">
		<span class="gallery-brand-mark"></span>
		<z-text size="sm" weight="600">Voxel</z-text>
		<z-text size="sm" color="muted">{countLabel}</z-text>
	</div>
	<div class="gallery-actions">
		<z-button size="small" kind="ghost" tone="neutral" onclick={importProjectFile}>
			<UploadSimpleIcon size={16} weight="bold" />
			Import
		</z-button>
		<z-button size="small" kind="ghost" tone="neutral" onclick={openKeymap}>
			<KeyboardIcon size={16} weight="bold" />
			Keys
		</z-button>
	</div>
</header>

{#if isMoving}
	<div class="gallery-moving">
		<z-text size="sm">Aim at the floor, click to drop. Right click cancels.</z-text>
	</div>
{/if}
