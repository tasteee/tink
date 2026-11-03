import { Vector3 } from 'three'

// Per-frame input, kept outside Svelte reactivity. The frame
// loop reads and drains it; nothing here should re-render UI.
export const input = {
	heldCodes: new Set<string>(),
	lookDeltaX: 0,
	lookDeltaY: 0,
	// tool drag (extrude / stamp depth) eats mouse movement
	isLookFrozen: false,
	dragDeltaY: 0
}

export const MOUSE_SENSITIVITY = 0.0022

// The flying camera, shared by the gallery and the workspace.
export const cameraRig = {
	position: new Vector3(0, 2, 0),
	yaw: 0,
	pitch: 0,
	forward: new Vector3(0, 0, -1)
}

export const placeCamera = (x: number, y: number, z: number, yaw: number, pitch: number): void => {
	cameraRig.position.set(x, y, z)
	cameraRig.yaw = yaw
	cameraRig.pitch = pitch
}

export const resetHeldInput = (): void => {
	input.heldCodes.clear()
	input.lookDeltaX = 0
	input.lookDeltaY = 0
	input.dragDeltaY = 0
	input.isLookFrozen = false
}
