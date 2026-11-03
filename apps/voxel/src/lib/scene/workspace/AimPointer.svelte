<script lang="ts">
	import { T, useTask } from '@threlte/core'
	import { BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, PlaneGeometry, RingGeometry, Vector3 } from 'three'
	import { live } from '../../state/interaction'
	import { cameraRig } from '../../state/input'
	import { editor } from '../../state/editor.svelte'
	import { readTokenColor } from '../tokenColor'

	const pointerColor = readTokenColor('--color-neutral-9')
	const highlightColor = readTokenColor('--accent')
	const dangerColor = readTokenColor('--destructive')

	const ringMaterial = new MeshBasicMaterial({ color: pointerColor, depthTest: false, transparent: true })
	const ring = new Mesh(new RingGeometry(0.55, 1, 40), ringMaterial)
	ring.renderOrder = 30

	const faceMaterial = new MeshBasicMaterial({ color: highlightColor, transparent: true, opacity: 0.38, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
	const face = new Mesh(new PlaneGeometry(1, 1), faceMaterial)
	face.renderOrder = 20

	const lineGeometry = new BufferGeometry()
	lineGeometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3))
	const lineMaterial = new LineBasicMaterial({ color: pointerColor, transparent: true, opacity: 0.7, depthTest: false })
	const line = new Line(lineGeometry, lineMaterial)
	line.renderOrder = 29
	line.frustumCulled = false

	const lookTarget = new Vector3()
	const lineStart = new Vector3()
	const rightVector = new Vector3()
	const upVector = new Vector3()
	const FACE_LIFT = 0.012

	const applyTone = (): void => {
		const isDelete = editor.isDeleteMode
		const ringColor = isDelete ? dangerColor : pointerColor
		const faceColor = isDelete ? dangerColor : highlightColor
		ringMaterial.color.copy(ringColor)
		lineMaterial.color.copy(ringColor)
		faceMaterial.color.copy(faceColor)
	}

	// The face under the circle. For a voxel it is the face that
	// was hit; for a wall it is the wall square itself.
	const placeFace = (): void => {
		const aim = live.aim
		if (!aim) return
		const isVoxel = aim.kind === 'voxel'
		const baseCell = isVoxel ? aim.cell : aim.placeCell
		const faceSide = isVoxel ? 0.5 : -0.5
		const centerX = baseCell[0] + 0.5 + aim.normal[0] * (faceSide + FACE_LIFT)
		const centerY = baseCell[1] + 0.5 + aim.normal[1] * (faceSide + FACE_LIFT)
		const centerZ = baseCell[2] + 0.5 + aim.normal[2] * (faceSide + FACE_LIFT)
		face.position.set(centerX, centerY, centerZ)
		lookTarget.set(centerX + aim.normal[0], centerY + aim.normal[1], centerZ + aim.normal[2])
		face.lookAt(lookTarget)
	}

	const placeRing = (): void => {
		const aim = live.aim
		if (!aim) return
		const ringX = aim.point[0] + aim.normal[0] * FACE_LIFT * 2
		const ringY = aim.point[1] + aim.normal[1] * FACE_LIFT * 2
		const ringZ = aim.point[2] + aim.normal[2] * FACE_LIFT * 2
		ring.position.set(ringX, ringY, ringZ)
		lookTarget.set(ringX + aim.normal[0], ringY + aim.normal[1], ringZ + aim.normal[2])
		ring.lookAt(lookTarget)
		const ringSize = Math.min(Math.max(aim.distance * 0.012, 0.08), 1.6)
		ring.scale.setScalar(ringSize)
	}

	// VR-style beam from just below and right of the view.
	const placeLine = (): void => {
		const aim = live.aim
		if (!aim) return
		rightVector.set(Math.cos(cameraRig.yaw), 0, -Math.sin(cameraRig.yaw))
		upVector.set(0, 1, 0)
		lineStart.copy(cameraRig.position)
		lineStart.addScaledVector(cameraRig.forward, 0.6)
		lineStart.addScaledVector(rightVector, 0.22)
		lineStart.addScaledVector(upVector, -0.26)
		const positions = lineGeometry.getAttribute('position')
		positions.setXYZ(0, lineStart.x, lineStart.y, lineStart.z)
		positions.setXYZ(1, ring.position.x, ring.position.y, ring.position.z)
		positions.needsUpdate = true
	}

	useTask(
		'aim-pointer',
		() => {
			const hasAim = live.aim !== null
			ring.visible = hasAim
			face.visible = hasAim
			line.visible = hasAim
			if (!hasAim) return
			applyTone()
			placeFace()
			placeRing()
			placeLine()
		},
		{ after: 'workspace-aim' }
	)
</script>

<T is={face} />
<T is={ring} />
<T is={line} />
