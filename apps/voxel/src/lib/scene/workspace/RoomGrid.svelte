<script lang="ts">
	import { T } from '@threlte/core'
	import { BackSide, BoxGeometry, LineBasicMaterial, MeshBasicMaterial, MeshStandardMaterial } from 'three'
	import { buildRoomGridGeometry } from './roomGeometry'
	import { readTokenColor } from '../tokenColor'
	import type { Vec3T } from '../../model/types'

	type RoomGridPropsT = {
		roomSize: Vec3T
		isRenderView: boolean
	}

	let props: RoomGridPropsT = $props()

	const gridGeometry = $derived(buildRoomGridGeometry(props.roomSize))
	const shellGeometry = $derived(new BoxGeometry(props.roomSize[0], props.roomSize[1], props.roomSize[2]))
	const shellPosition = $derived<Vec3T>([props.roomSize[0] / 2, props.roomSize[1] / 2, props.roomSize[2] / 2])

	const minorMaterial = new LineBasicMaterial({ color: readTokenColor('--line'), transparent: true, opacity: 0.55 })
	const majorMaterial = new LineBasicMaterial({ color: readTokenColor('--color-neutral-4'), transparent: true, opacity: 0.8 })
	const flatShellMaterial = new MeshBasicMaterial({ color: readTokenColor('--bg'), side: BackSide })
	const litShellMaterial = new MeshStandardMaterial({ color: readTokenColor('--color-neutral-7'), side: BackSide, roughness: 1 })
	const shellMaterial = $derived(props.isRenderView ? litShellMaterial : flatShellMaterial)
	const isMinorGridVisible = $derived(!props.isRenderView)

	$effect(() => {
		const currentGrid = gridGeometry
		const currentShell = shellGeometry

		return () => {
			currentGrid.minor.dispose()
			currentGrid.major.dispose()
			currentShell.dispose()
		}
	})
</script>

<T.Mesh geometry={shellGeometry} material={shellMaterial} position={shellPosition} receiveShadow />
<T.LineSegments geometry={gridGeometry.minor} material={minorMaterial} visible={isMinorGridVisible} />
<T.LineSegments geometry={gridGeometry.major} material={majorMaterial} />
