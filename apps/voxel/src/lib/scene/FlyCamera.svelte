<script lang="ts">
	import { untrack } from 'svelte'
	import { T, useTask } from '@threlte/core'
	import { PerspectiveCamera, Vector3 } from 'three'
	import { checkIsHeldAction } from '../state/keymap.svelte'
	import { cameraRig, input } from '../state/input'
	import type { Vec3T } from '../model/types'

	type FlyCameraPropsT = {
		// unique per scene, so the next scene can mount first
		taskKey: symbol
		boundsMin: Vec3T
		boundsMax: Vec3T
		speed: number
	}

	let props: FlyCameraPropsT = $props()

	const camera = new PerspectiveCamera(70, 1, 0.05, 4000)
	camera.rotation.order = 'YXZ'
	const PITCH_LIMIT = Math.PI / 2 - 0.02
	const BOOST_FACTOR = 2.6
	const moveVector = new Vector3()
	const forwardVector = new Vector3()
	const rightVector = new Vector3()

	const applyLook = (): void => {
		cameraRig.yaw -= input.lookDeltaX
		const nextPitch = cameraRig.pitch - input.lookDeltaY
		cameraRig.pitch = Math.min(Math.max(nextPitch, -PITCH_LIMIT), PITCH_LIMIT)
		input.lookDeltaX = 0
		input.lookDeltaY = 0
	}

	const toAxisValue = (isPositive: boolean, isNegative: boolean): number => {
		const positivePart = isPositive ? 1 : 0
		const negativePart = isNegative ? 1 : 0
		return positivePart - negativePart
	}

	// Horizontal WASD relative to where you look, Space / C
	// straight up and down.
	const applyMovement = (delta: number): void => {
		const held = input.heldCodes
		const forwardAmount = toAxisValue(checkIsHeldAction('moveForward', held), checkIsHeldAction('moveBack', held))
		const strafeAmount = toAxisValue(checkIsHeldAction('moveRight', held), checkIsHeldAction('moveLeft', held))
		const liftAmount = toAxisValue(checkIsHeldAction('flyUp', held), checkIsHeldAction('flyDown', held))
		const isBoosting = checkIsHeldAction('boost', held)
		const speed = isBoosting ? props.speed * BOOST_FACTOR : props.speed

		forwardVector.set(-Math.sin(cameraRig.yaw), 0, -Math.cos(cameraRig.yaw))
		rightVector.set(-forwardVector.z, 0, forwardVector.x)
		moveVector.set(0, 0, 0)
		moveVector.addScaledVector(forwardVector, forwardAmount)
		moveVector.addScaledVector(rightVector, strafeAmount)
		moveVector.y += liftAmount

		const isMoving = moveVector.lengthSq() > 0
		if (!isMoving) return
		moveVector.normalize().multiplyScalar(speed * delta)
		cameraRig.position.add(moveVector)
	}

	const clampToBounds = (): void => {
		const position = cameraRig.position
		position.x = Math.min(Math.max(position.x, props.boundsMin[0]), props.boundsMax[0])
		position.y = Math.min(Math.max(position.y, props.boundsMin[1]), props.boundsMax[1])
		position.z = Math.min(Math.max(position.z, props.boundsMin[2]), props.boundsMax[2])
	}

	// The key is fixed for the life of the scene.
	const taskKey = untrack(() => props.taskKey)

	useTask(taskKey, (delta) => {
		const clampedDelta = Math.min(delta, 0.05)
		applyLook()
		applyMovement(clampedDelta)
		clampToBounds()
		camera.position.copy(cameraRig.position)
		camera.rotation.set(cameraRig.pitch, cameraRig.yaw, 0)
		camera.getWorldDirection(cameraRig.forward)
	})
</script>

<T is={camera} makeDefault />
