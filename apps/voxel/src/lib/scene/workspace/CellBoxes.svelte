<script lang="ts">
	import { T } from '@threlte/core'
	import { BoxGeometry, Color, InstancedMesh, Matrix4, MeshBasicMaterial } from 'three'
	import type { Vec3T } from '../../model/types'

	// Draws a translucent box on each cell, as one instanced mesh.
	// Used for tool ghosts and for the voxel selection.
	type CellBoxesPropsT = {
		cells: Vec3T[]
		color: Color
		opacity: number
		// > 1 so the box wraps an existing voxel
		scale: number
		renderOrder: number
	}

	let props: CellBoxesPropsT = $props()

	const sharedGeometry = new BoxGeometry(1, 1, 1)
	const material = new MeshBasicMaterial({ transparent: true, depthWrite: false })
	const matrix = new Matrix4()
	const STARTING_CAPACITY = 1024

	const getCapacityFor = (cellCount: number): number => {
		const doubled = Math.max(STARTING_CAPACITY, cellCount * 2)
		return Math.ceil(doubled / STARTING_CAPACITY) * STARTING_CAPACITY
	}

	const createInstances = (capacity: number): InstancedMesh => {
		const created = new InstancedMesh(sharedGeometry, material, capacity)
		created.frustumCulled = false
		created.count = 0
		return created
	}

	let instances = $state.raw(createInstances(STARTING_CAPACITY))

	$effect(() => {
		material.color.copy(props.color)
		material.opacity = props.opacity
		instances.renderOrder = props.renderOrder
	})

	$effect(() => {
		const cells = props.cells
		const needsMoreRoom = cells.length > instances.instanceMatrix.count
		if (needsMoreRoom) instances = createInstances(getCapacityFor(cells.length))
		const target = instances
		const halfStep = 0.5

		for (const [cellIndex, cell] of cells.entries()) {
			matrix.makeScale(props.scale, props.scale, props.scale)
			matrix.setPosition(cell[0] + halfStep, cell[1] + halfStep, cell[2] + halfStep)
			target.setMatrixAt(cellIndex, matrix)
		}

		target.count = cells.length
		target.instanceMatrix.needsUpdate = true
	})
</script>

<T is={instances} />
