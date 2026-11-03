<script lang="ts">
	import { T } from '@threlte/core'
	import { HTML, Outlines } from '@threlte/extras'
	import type { Material, BufferGeometry } from 'three'
	import { buildProjectModel } from './projectMesh'
	import './Pedestal.css'
	import { readTokenColor } from '../tokenColor'
	import type { ProjectT, Vec3T } from '../../model/types'

	type PedestalPropsT = {
		project: ProjectT
		position: Vec3T
		isAimed: boolean
		isMoving: boolean
		pedestalGeometry: BufferGeometry
		pedestalMaterial: Material
		modelMaterial: Material
	}

	let props: PedestalPropsT = $props()

	const outlineColor = readTokenColor('--accent')
	const model = $derived(buildProjectModel(props.project))
	const hasModel = $derived(!model.isEmpty)
	const isHighlighted = $derived(props.isAimed || props.isMoving)
	const labelClass = $derived(isHighlighted ? 'pedestal-label isAimed' : 'pedestal-label')
	const hintLabel = $derived(props.isMoving ? 'Click to drop' : 'Click to open · E for menu')

	$effect(() => {
		const currentModel = model
		return () => currentModel.geometry.dispose()
	})
</script>

<T.Group position={props.position}>
	<T.Mesh geometry={props.pedestalGeometry} material={props.pedestalMaterial} position.y={0.5} castShadow receiveShadow>
		{#if isHighlighted}
			<Outlines color={outlineColor} thickness={0.035} />
		{/if}
	</T.Mesh>

	{#if hasModel}
		<T.Mesh geometry={model.geometry} material={props.modelMaterial} position.y={1} castShadow receiveShadow>
			{#if isHighlighted}
				<Outlines color={outlineColor} thickness={0.03} />
			{/if}
		</T.Mesh>
	{/if}

	<HTML position.y={3.55} center pointerEvents="none">
		<div class={labelClass}>
			<span class="pedestal-name">{props.project.name}</span>
			{#if isHighlighted}
				<span class="pedestal-hint">{hintLabel}</span>
			{/if}
		</div>
	</HTML>
</T.Group>
