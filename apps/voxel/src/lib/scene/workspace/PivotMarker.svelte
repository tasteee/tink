<script lang="ts">
	import { T } from '@threlte/core'
	import { BufferGeometry, Color, Float32BufferAttribute, LineBasicMaterial, MeshBasicMaterial, SphereGeometry } from 'three'
	import { readTokenColor } from '../tokenColor'
	import type { Vec3T } from '../../model/types'

	// Three colored axis lines through the pivot, drawn on top
	// of the voxels so the pivot is visible inside a model.
	type PivotMarkerPropsT = {
		pivot: Vec3T
		size: number
	}

	let props: PivotMarkerPropsT = $props()

	// x, y, z. Blue has no zest token, so z keeps the
	// universal axis color.
	const Z_AXIS_COLOR = new Color('#4c9bff')
	const AXIS_COLORS = [readTokenColor('--destructive'), readTokenColor('--success'), Z_AXIS_COLOR]

	const buildAxisGeometry = (size: number): BufferGeometry => {
		const geometry = new BufferGeometry()
		const positions = [-size, 0, 0, size, 0, 0, 0, -size, 0, 0, size, 0, 0, 0, -size, 0, 0, size]
		const colors: number[] = []

		for (const axisColor of AXIS_COLORS) {
			colors.push(axisColor.r, axisColor.g, axisColor.b, axisColor.r, axisColor.g, axisColor.b)
		}

		geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
		geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
		return geometry
	}

	const axisGeometry = $derived(buildAxisGeometry(props.size))
	const axisMaterial = new LineBasicMaterial({ vertexColors: true, depthTest: false, transparent: true })
	const dotGeometry = new SphereGeometry(0.22, 16, 12)
	const dotMaterial = new MeshBasicMaterial({ color: readTokenColor('--color-neutral-9'), depthTest: false, transparent: true })

	$effect(() => {
		const currentGeometry = axisGeometry
		return () => currentGeometry.dispose()
	})
</script>

<T.Group position={props.pivot}>
	<T.LineSegments geometry={axisGeometry} material={axisMaterial} renderOrder={40} />
	<T.Mesh geometry={dotGeometry} material={dotMaterial} renderOrder={41} />
</T.Group>
