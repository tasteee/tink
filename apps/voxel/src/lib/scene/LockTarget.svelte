<script lang="ts">
	import { useThrelte } from '@threlte/core'
	import { setLockTarget } from '../state/controls'

	// Hands the canvas to the controls, so clicking it starts
	// flying (pointer lock).
	const threlte = useThrelte()

	$effect(() => {
		const canvas = threlte.renderer.domElement
		setLockTarget(canvas)
		return () => setLockTarget(null)
	})
</script>
