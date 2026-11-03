<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core'
	import { MeshBasicMaterial, MeshStandardMaterial } from 'three'
	import type { Color, DirectionalLight } from 'three'
	import FlyCamera from '../FlyCamera.svelte'
	import RoomGrid from './RoomGrid.svelte'
	import GroupMesh from './GroupMesh.svelte'
	import AimPointer from './AimPointer.svelte'
	import GhostPreview from './GhostPreview.svelte'
	import SelectionOverlay from './SelectionOverlay.svelte'
	import PivotMarker from './PivotMarker.svelte'
	import { buildColorTable } from '../../model/mesher'
	import { checkIsGroupHidden, findGroup } from '../../model/groups'
	import { editor } from '../../state/editor.svelte'
	import { getPivotTargetGroupId, updateWorkspaceAim } from '../../state/interaction'
	import { cameraRig } from '../../state/input'
	import { readTokenColor } from '../tokenColor'
	import type { ProjectMetaT, Vec3T } from '../../model/types'

	type WorkspaceScenePropsT = {
		meta: ProjectMetaT
	}

	let props: WorkspaceScenePropsT = $props()

	const threlte = useThrelte()
	const cameraTaskKey = Symbol('workspace-camera')
	const aimTaskKey = Symbol('workspace-aim')
	const roomSize = $derived(props.meta.roomSize)
	const isRenderView = $derived(editor.viewMode === 'render')
	const boundsMin: Vec3T = [0.3, 0.3, 0.3]
	const boundsMax = $derived<Vec3T>([roomSize[0] - 0.3, roomSize[1] - 0.3, roomSize[2] - 0.3])
	const flySpeed = $derived(Math.max(10, Math.max(roomSize[0], roomSize[2]) * 0.16))

	const colorTable = $derived(buildColorTable(props.meta.colors))
	const visibleGroups = $derived(props.meta.groups.filter((group) => !checkIsGroupHidden(props.meta.groups, group.id)))

	const flatMaterial = new MeshBasicMaterial({ vertexColors: true })
	const litMaterial = new MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0 })
	const voxelMaterial = $derived(isRenderView ? litMaterial : flatMaterial)

	const isPivotToolActive = $derived(editor.tool === 'object' || editor.tool === 'pivot')
	const pivotGroupId = $derived(isPivotToolActive ? getPivotTargetGroupId() : '')
	const pivotGroup = $derived(findGroup(props.meta.groups, pivotGroupId))
	const pivotMarkerSize = $derived(Math.max(4, Math.min(roomSize[0], roomSize[2]) * 0.08))

	const roomCenter = $derived<Vec3T>([roomSize[0] / 2, roomSize[1] / 2, roomSize[2] / 2])
	const largestSide = $derived(Math.max(roomSize[0], roomSize[1], roomSize[2]))
	const sunPosition = $derived<Vec3T>([roomSize[0] * 0.15, roomSize[1] * 0.95, roomSize[2] * 0.3])
	const shadowExtent = $derived(largestSide * 0.9)

	const hemisphereArgs: [Color, Color, number] = [readTokenColor('--color-neutral-9'), readTokenColor('--color-neutral-4'), 1.1]

	const handleSunCreate = (light: DirectionalLight): void => {
		light.target.position.set(roomCenter[0], 0, roomCenter[2])
		light.target.updateMatrixWorld()
	}

	const getMeshVersion = (groupId: string): number => {
		return editor.meshVersions[groupId] ?? 0
	}

	$effect(() => {
		const backgroundToken = isRenderView ? '--color-neutral-7' : '--bg'
		threlte.scene.background = readTokenColor(backgroundToken)
	})

	useTask(
		aimTaskKey,
		() => {
			const origin: Vec3T = [cameraRig.position.x, cameraRig.position.y, cameraRig.position.z]
			const direction: Vec3T = [cameraRig.forward.x, cameraRig.forward.y, cameraRig.forward.z]
			updateWorkspaceAim(origin, direction)
		},
		{ after: cameraTaskKey }
	)
</script>

<FlyCamera taskKey={cameraTaskKey} {boundsMin} {boundsMax} speed={flySpeed} />
<RoomGrid {roomSize} {isRenderView} />

{#if isRenderView}
	<T.HemisphereLight args={hemisphereArgs} />
	<T.DirectionalLight
		position={sunPosition}
		intensity={2.2}
		castShadow
		shadow.mapSize.width={4096}
		shadow.mapSize.height={4096}
		shadow.camera.left={-shadowExtent}
		shadow.camera.right={shadowExtent}
		shadow.camera.top={shadowExtent}
		shadow.camera.bottom={-shadowExtent}
		shadow.camera.near={0.5}
		shadow.camera.far={largestSide * 3}
		shadow.bias={-0.0004}
		shadow.normalBias={0.04}
		shadow.radius={6}
		oncreate={handleSunCreate}
	/>
{/if}

{#each visibleGroups as group (group.id)}
	<GroupMesh groupId={group.id} version={getMeshVersion(group.id)} {colorTable} {isRenderView} material={voxelMaterial} />
{/each}

<SelectionOverlay />
<GhostPreview {aimTaskKey} />
<AimPointer {aimTaskKey} />

{#if pivotGroup}
	<PivotMarker pivot={pivotGroup.pivot} size={pivotMarkerSize} />
{/if}
