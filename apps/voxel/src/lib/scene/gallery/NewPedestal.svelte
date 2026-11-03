<script lang="ts">
	import { T, useTask } from '@threlte/core'
	import { HTML, Outlines } from '@threlte/extras'
	import { BoxGeometry, MeshBasicMaterial } from 'three'
	import type { BufferGeometry, Material } from 'three'
	import { readTokenColor } from '../tokenColor'
	import type { Vec3T } from '../../model/types'
	import './Pedestal.css'

	type NewPedestalPropsT = {
		position: Vec3T
		isAimed: boolean
		pedestalGeometry: BufferGeometry
		pedestalMaterial: Material
	}

	let props: NewPedestalPropsT = $props()

	const accentColor = readTokenColor('--accent')
	const plusMaterial = new MeshBasicMaterial({ color: accentColor, transparent: true })
	const barGeometry = new BoxGeometry(0.9, 0.22, 0.22)
	const QUARTER_TURN = Math.PI / 2
	const labelClass = $derived(props.isAimed ? 'pedestal-label isAimed' : 'pedestal-label')
	let spin = $state(0)
	let elapsed = 0

	// A soft breathing glow on the plus.
	useTask((delta) => {
		elapsed += delta
		spin += delta * 0.6
		const pulse = 0.72 + Math.sin(elapsed * 2.4) * 0.28
		plusMaterial.opacity = pulse
	})
</script>

<T.Group position={props.position}>
	<T.Mesh geometry={props.pedestalGeometry} material={props.pedestalMaterial} position.y={0.5} receiveShadow>
		{#if props.isAimed}
			<Outlines color={accentColor} thickness={0.035} />
		{/if}
	</T.Mesh>

	<T.Group position.y={1.8} rotation.y={spin}>
		<T.Mesh geometry={barGeometry} material={plusMaterial} />
		<T.Mesh geometry={barGeometry} material={plusMaterial} rotation.z={QUARTER_TURN} />
	</T.Group>

	<HTML position.y={3.1} center pointerEvents="none">
		<div class={labelClass}>
			<span class="pedestal-name">New project</span>
			{#if props.isAimed}
				<span class="pedestal-hint">Click to start · E to import</span>
			{/if}
		</div>
	</HTML>
</T.Group>
