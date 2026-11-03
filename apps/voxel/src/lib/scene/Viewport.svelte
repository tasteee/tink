<script lang="ts">
	import { Canvas } from '@threlte/core'
	import { NoToneMapping, NeutralToneMapping, PCFShadowMap } from 'three'
	import LockTarget from './LockTarget.svelte'
	import WorkspaceScene from './workspace/WorkspaceScene.svelte'
	import GalleryScene from './gallery/GalleryScene.svelte'
	import { editor } from '../state/editor.svelte'
	import { ui } from '../state/ui.svelte'
	import './Viewport.css'

	// Flat view shows colors exactly as picked, so no tone mapping.
	const isRenderView = $derived(editor.viewMode === 'render' && ui.route === 'workspace')
	const toneMapping = $derived(isRenderView ? NeutralToneMapping : NoToneMapping)
	const workspaceMeta = $derived(ui.route === 'workspace' ? editor.meta : null)
	const isGallery = $derived(ui.route === 'gallery')
	const pixelRatioRange: [number, number] = [1, 2]
</script>

<div class="viewport">
	<Canvas {toneMapping} shadows={PCFShadowMap} dpr={pixelRatioRange}>
		<LockTarget />
		{#if workspaceMeta}
			{#key workspaceMeta.id}
				<WorkspaceScene meta={workspaceMeta} />
			{/key}
		{:else if isGallery}
			<GalleryScene />
		{/if}
	</Canvas>
</div>
