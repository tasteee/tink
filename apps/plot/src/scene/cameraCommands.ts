// Camera turns requested by HUD buttons. The camera rig eases
// toward the target each frame and drains this value.
let pendingTurnRadians = 0

export const requestCameraTurn = (direction: number): void => {
	pendingTurnRadians += direction * (Math.PI / 2)
}

export const takeCameraTurnStep = (deltaSeconds: number): number => {
	const isSettled = Math.abs(pendingTurnRadians) < 0.0005
	if (isSettled) {
		const remainder = pendingTurnRadians
		pendingTurnRadians = 0
		return remainder
	}

	const easing = Math.min(1, deltaSeconds * 9)
	const step = pendingTurnRadians * easing
	pendingTurnRadians -= step
	return step
}
