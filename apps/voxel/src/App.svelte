<script lang="ts">
	import Viewport from './lib/scene/Viewport.svelte'
	import Hud from './lib/ui/Hud.svelte'
	import { setupControls } from './lib/state/controls'
	import { GALLERY_SPAWN, gallery, loadGalleryState } from './lib/state/gallery.svelte'
	import { placeCamera } from './lib/state/input'
	import { showToast } from './lib/state/ui.svelte'

	const startGallery = async (): Promise<void> => {
		placeCamera(GALLERY_SPAWN[0], GALLERY_SPAWN[1], GALLERY_SPAWN[2], 0, -0.08)

		try {
			await loadGalleryState()
		} catch (loadError) {
			console.error(loadError)
			gallery.isLoaded = true
			showToast('Could not open browser storage. Changes will not be saved.', 'danger')
		}
	}

	$effect(() => {
		startGallery()
		return setupControls()
	})
</script>

<main class="app">
	{#if gallery.isLoaded}
		<Viewport />
		<Hud />
	{:else}
		<div class="app-loading">
			<z-text size="sm" color="muted">Opening your gallery…</z-text>
		</div>
	{/if}
</main>
