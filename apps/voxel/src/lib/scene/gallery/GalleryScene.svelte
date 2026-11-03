<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core'
	import { BackSide, BoxGeometry, LineBasicMaterial, MeshLambertMaterial } from 'three'
	import type { Color, DirectionalLight } from 'three'
	import FlyCamera from '../FlyCamera.svelte'
	import Pedestal from './Pedestal.svelte'
	import NewPedestal from './NewPedestal.svelte'
	import { intersectRayBox } from './projectMesh'
	import type { AabbT } from './projectMesh'
	import { buildRoomGridGeometry } from '../workspace/roomGeometry'
	import { readTokenColor } from '../tokenColor'
	import { GALLERY_SIZE, NEW_PEDESTAL_ID, NEW_PEDESTAL_POSITION, findProject, gallery, moveLayoutEntry } from '../../state/gallery.svelte'
	import { cameraRig } from '../../state/input'
	import type { GalleryEntryT, ProjectT, Vec3T } from '../../model/types'

	const threlte = useThrelte()
	const AIM_RANGE = 16
	const boundsMin: Vec3T = [-GALLERY_SIZE[0] / 2 + 0.6, 0.8, -GALLERY_SIZE[2] / 2 + 0.6]
	const boundsMax: Vec3T = [GALLERY_SIZE[0] / 2 - 0.6, GALLERY_SIZE[1] - 0.6, GALLERY_SIZE[2] / 2 - 0.6]
	const roomOffset: Vec3T = [-GALLERY_SIZE[0] / 2, 0, -GALLERY_SIZE[2] / 2]
	const shellPosition: Vec3T = [0, GALLERY_SIZE[1] / 2, 0]

	const pedestalGeometry = new BoxGeometry(1.9, 1, 1.9)
	const pedestalMaterial = new MeshLambertMaterial({ color: readTokenColor('--color-neutral-2') })
	const modelMaterial = new MeshLambertMaterial({ vertexColors: true })
	const shellGeometry = new BoxGeometry(GALLERY_SIZE[0], GALLERY_SIZE[1], GALLERY_SIZE[2])
	const shellMaterial = new MeshLambertMaterial({ color: readTokenColor('--paper'), side: BackSide })
	const roomGrid = buildRoomGridGeometry(GALLERY_SIZE)
	const minorGridMaterial = new LineBasicMaterial({ color: readTokenColor('--line'), transparent: true, opacity: 0.5 })
	const majorGridMaterial = new LineBasicMaterial({ color: readTokenColor('--color-neutral-4'), transparent: true, opacity: 0.7 })
	const sunPosition: Vec3T = [8, 16, 6]
	const hemisphereArgs: [Color, Color, number] = [readTokenColor('--color-neutral-9'), readTokenColor('--color-neutral-2'), 1.6]

	type PlacedProjectT = {
		entry: GalleryEntryT
		project: ProjectT
	}

	const placedProjects = $derived.by(() => {
		const placed: PlacedProjectT[] = []

		for (const entry of gallery.layout.projects) {
			const project = findProject(entry.projectId)
			if (project) placed.push({ entry, project })
		}

		return placed
	})

	const isNewPedestalAimed = $derived(gallery.aimedId === NEW_PEDESTAL_ID)

	const buildPedestalBox = (position: Vec3T): AabbT => {
		return { center: [position[0], 1.5, position[2]], half: [1, 1.5, 1] }
	}

	const findAimedId = (origin: Vec3T, direction: Vec3T): string => {
		let closestId = ''
		let closestDistance = AIM_RANGE
		const newPedestalDistance = intersectRayBox(origin, direction, buildPedestalBox(NEW_PEDESTAL_POSITION))

		if (newPedestalDistance < closestDistance) {
			closestId = NEW_PEDESTAL_ID
			closestDistance = newPedestalDistance
		}

		for (const placed of placedProjects) {
			const distance = intersectRayBox(origin, direction, buildPedestalBox(placed.entry.position))
			const isCloser = distance < closestDistance
			if (!isCloser) continue
			closestId = placed.project.id
			closestDistance = distance
		}

		return closestId
	}

	// While moving, the pedestal follows the floor point you aim at.
	const followFloor = (origin: Vec3T, direction: Vec3T): void => {
		const isLookingDown = direction[1] < -0.02
		if (!isLookingDown) return
		const floorTime = -origin[1] / direction[1]
		const floorX = origin[0] + direction[0] * floorTime
		const floorZ = origin[2] + direction[2] * floorTime
		moveLayoutEntry(gallery.movingProjectId, floorX, floorZ)
	}

	const handleSunCreate = (light: DirectionalLight): void => {
		light.target.position.set(0, 0, 0)
		light.target.updateMatrixWorld()
	}

	$effect(() => {
		threlte.scene.background = readTokenColor('--bg')
	})

	useTask(
		'gallery-aim',
		() => {
			const origin: Vec3T = [cameraRig.position.x, cameraRig.position.y, cameraRig.position.z]
			const direction: Vec3T = [cameraRig.forward.x, cameraRig.forward.y, cameraRig.forward.z]
			const isMoving = gallery.movingProjectId !== ''

			if (isMoving) {
				followFloor(origin, direction)
				return
			}

			const aimedId = findAimedId(origin, direction)
			const hasChanged = aimedId !== gallery.aimedId
			if (hasChanged) gallery.aimedId = aimedId
		},
		{ after: 'fly-camera' }
	)
</script>

<FlyCamera {boundsMin} {boundsMax} speed={8} />

<T.HemisphereLight args={hemisphereArgs} />
<T.DirectionalLight position={sunPosition} intensity={1.6} castShadow shadow.mapSize.width={2048} shadow.mapSize.height={2048} shadow.camera.left={-24} shadow.camera.right={24} shadow.camera.top={24} shadow.camera.bottom={-24} oncreate={handleSunCreate} />

<T.Mesh geometry={shellGeometry} material={shellMaterial} position={shellPosition} receiveShadow />
<T.Group position={roomOffset}>
	<T.LineSegments geometry={roomGrid.minor} material={minorGridMaterial} />
	<T.LineSegments geometry={roomGrid.major} material={majorGridMaterial} />
</T.Group>

<NewPedestal position={NEW_PEDESTAL_POSITION} isAimed={isNewPedestalAimed} {pedestalGeometry} {pedestalMaterial} />

{#each placedProjects as placed (placed.project.id)}
	<Pedestal
		project={placed.project}
		position={placed.entry.position}
		isAimed={gallery.aimedId === placed.project.id}
		isMoving={gallery.movingProjectId === placed.project.id}
		{pedestalGeometry}
		{pedestalMaterial}
		{modelMaterial}
	/>
{/each}
