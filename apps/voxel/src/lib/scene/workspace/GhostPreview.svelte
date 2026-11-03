<script lang="ts">
	import { useTask } from '@threlte/core'
	import { Color } from 'three'
	import CellBoxes from './CellBoxes.svelte'
	import { live } from '../../state/interaction'
	import { editor } from '../../state/editor.svelte'
	import { readTokenColor } from '../tokenColor'
	import type { Vec3T } from '../../model/types'

	// Shows exactly what the next click will add or carve.
	let ghostCells = $state.raw<Vec3T[]>([])
	let isRemoval = $state(false)
	let seenVersion = -1

	const dangerColor = readTokenColor('--destructive')
	const addColor = $derived(new Color(editor.selectedColor))
	const ghostColor = $derived(isRemoval ? dangerColor : addColor)
	const ghostOpacity = $derived(isRemoval ? 0.42 : 0.5)
	const ghostScale = $derived(isRemoval ? 1.04 : 0.98)

	useTask(
		'ghost-preview',
		() => {
			const isSameVersion = seenVersion === live.ghostVersion
			if (isSameVersion) return
			seenVersion = live.ghostVersion
			ghostCells = live.ghostCells
			isRemoval = live.isGhostRemoval
		},
		{ after: 'workspace-aim' }
	)
</script>

<CellBoxes cells={ghostCells} color={ghostColor} opacity={ghostOpacity} scale={ghostScale} renderOrder={10} />
