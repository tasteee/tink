import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MOUSE, TOUCH, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { HALF_LOT } from '../game/constants'
import { useTool } from '../game/store'
import { checkIsDrawingTool } from '../game/interaction'
import { takeCameraTurnStep } from './cameraCommands'

const PAN_LIMIT = HALF_LOT + 6
const upAxis = new Vector3(0, 1, 0)
const offset = new Vector3()

const clamp = (value: number, min: number, max: number): number => {
	return Math.min(max, Math.max(min, value))
}

const buildControls = (camera: ConstructorParameters<typeof OrbitControls>[0], domElement: HTMLElement): OrbitControls => {
	const controls = new OrbitControls(camera, domElement)
	controls.enableDamping = true
	controls.dampingFactor = 0.12
	controls.minDistance = 5
	controls.maxDistance = 40
	controls.minPolarAngle = 0.3
	controls.maxPolarAngle = 1.22
	controls.screenSpacePanning = false
	return controls
}

// Mobile mapping: one finger pans (or draws, in floor/wall
// mode), two fingers pinch-zoom and orbit/pan. Desktop: left
// drag pans, right drag orbits, wheel zooms.
const applyGestureMapping = (controls: OrbitControls, isDrawingTool: boolean): void => {
	const oneFingerAction = isDrawingTool ? null : TOUCH.PAN
	const twoFingerAction = isDrawingTool ? TOUCH.DOLLY_PAN : TOUCH.DOLLY_ROTATE
	const leftMouseAction = isDrawingTool ? null : MOUSE.PAN
	controls.touches = { ONE: oneFingerAction, TWO: twoFingerAction }
	controls.mouseButtons = { LEFT: leftMouseAction, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE }
}

export const CameraRig = () => {
	const camera = useThree((state) => state.camera)
	const domElement = useThree((state) => state.gl.domElement)
	const setDefaultControls = useThree((state) => state.set)
	const controls = useMemo(() => {
		return buildControls(camera, domElement)
	}, [camera, domElement])
	const tool = useTool()
	const isDrawingTool = checkIsDrawingTool(tool)

	useEffect(() => {
		setDefaultControls({ controls })
		return () => {
			controls.dispose()
		}
	}, [controls, setDefaultControls])

	useEffect(() => {
		applyGestureMapping(controls, isDrawingTool)
	}, [controls, isDrawingTool])

	useFrame((_state, deltaSeconds) => {
		const target = controls.target
		target.x = clamp(target.x, -PAN_LIMIT, PAN_LIMIT)
		target.z = clamp(target.z, -PAN_LIMIT, PAN_LIMIT)
		target.y = 0

		const turnStep = takeCameraTurnStep(deltaSeconds)
		const isTurning = turnStep !== 0
		if (isTurning) {
			offset.copy(camera.position).sub(target)
			offset.applyAxisAngle(upAxis, turnStep)
			camera.position.copy(target).add(offset)
		}

		controls.update(deltaSeconds)
	})

	return null
}
