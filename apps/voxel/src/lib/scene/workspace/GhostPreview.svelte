<script lang="ts">
	import { untrack } from 'svelte'
	import { useTask } from '@threlte/core'
	import { Color } from 'three'
	import CellBoxes from './CellBoxes.svelte'
	import { live } from '../../state/interaction'
	import type { GhostKindT } from '../../state/interaction'
	import { editor } from '../../state/editor.svelte'
	import { readTokenColor } from '../tokenColor'
	import type { Vec3T } from '../../model/types'

	type AimFollowerPropsT = {
		// runs after the scene's aim update each frame
		aimTaskKey: symbol
	}

	let props: AimFollowerPropsT = $props()

	// The key is fixed for the life of the scene.
	const aimTaskKey = untrack(() => props.aimTaskKey)

	// Shows exactly what the next click will add or carve.
	let ghostCells = $state.raw<Vec3T[]>([])
	let ghostKind = $state<GhostKindT>('add')
	let seenVersion = -1

	// Add sits just inside a cell; the rest mark voxels that
	// already exist, so they sit just outside.
	const dangerColor = readTokenColor('--destructive')
	const selectColor = readTokenColor('--accent')
	const paintColor = $derived(new Color(editor.selectedColor))
	const getGhostColor = (kind: GhostKindT): Color => {
		if (kind === 'remove') return dangerColor
		if (kind === 'select') return selectColor
		return paintColor
	}

	const getGhostScale = (kind: GhostKindT): number => {
		if (kind === 'add') return 0.98
		if (kind === 'select') return 1.08
		return 1.04
	}

	const ghostColor = $derived(getGhostColor(ghostKind))
	const ghostOpacity = $derived(ghostKind === 'remove' ? 0.42 : 0.5)
	const ghostScale = $derived(getGhostScale(ghostKind))

	useTask(
		() => {
			const isSameVersion = seenVersion === live.ghostVersion
			if (isSameVersion) return
			seenVersion = live.ghostVersion
			ghostCells = live.ghostCells
			ghostKind = live.ghostKind
		},
		{ after: aimTaskKey }
	)
</script>

<CellBoxes cells={ghostCells} color={ghostColor} opacity={ghostOpacity} scale={ghostScale} renderOrder={10} />
