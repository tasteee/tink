<script lang="ts">
	import { T } from '@threlte/core'
	import type { Color, Material } from 'three'
	import { buildVoxelGeometry } from '../../model/mesher'
	import { getCell, voxelDoc } from '../../model/voxelDoc'
	import { checkIsVisibleSolid } from '../../state/editor.svelte'

	type GroupMeshPropsT = {
		groupId: string
		version: number
		colorTable: Color[]
		isRenderView: boolean
		material: Material
	}

	let props: GroupMeshPropsT = $props()

	// One merged mesh per group. Rebuilt only when this group's
	// version bumps, the palette changes, or the view flips.
	const geometry = $derived.by(() => {
		const rebuildVersion = props.version
		const keys = voxelDoc.groupCells.get(props.groupId) ?? new Set<number>()

		const builtGeometry = buildVoxelGeometry({
			keys,
			getCell,
			checkIsBlocking: checkIsVisibleSolid,
			colorTable: props.colorTable,
			isFlatShaded: !props.isRenderView,
			hasAmbientOcclusion: props.isRenderView,
			origin: [0, 0, 0],
			scale: 1
		})

		builtGeometry.userData.version = rebuildVersion
		return builtGeometry
	})

	$effect(() => {
		const currentGeometry = geometry
		return () => currentGeometry.dispose()
	})
</script>

<T.Mesh {geometry} material={props.material} castShadow receiveShadow />
