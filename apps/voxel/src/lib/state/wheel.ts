import { TOOLS } from './tools'
import type { ToolIdT } from './tools'

export type WheelItemT = {
	id: ToolIdT | 'gallery'
	label: string
}

// Clockwise from the top.
export const WHEEL_ITEMS: WheelItemT[] = [
	...TOOLS.map((tool) => ({ id: tool.id, label: tool.name })),
	{ id: 'gallery', label: 'Gallery' }
]

export const WHEEL_RADIUS = 132
export const WHEEL_DEAD_ZONE = 28

// Which item a flick vector points at, or -1 inside the
// dead zone at the center.
export const getWheelIndex = (flickX: number, flickY: number): number => {
	const distance = Math.hypot(flickX, flickY)
	const isInDeadZone = distance < WHEEL_DEAD_ZONE
	if (isInDeadZone) return -1
	const angleFromTop = Math.atan2(flickX, -flickY)
	const fullTurn = Math.PI * 2
	const normalizedAngle = (angleFromTop + fullTurn) % fullTurn
	const sliceSize = fullTurn / WHEEL_ITEMS.length
	return Math.round(normalizedAngle / sliceSize) % WHEEL_ITEMS.length
}

export const getWheelItemPosition = (itemIndex: number): [number, number] => {
	const sliceSize = (Math.PI * 2) / WHEEL_ITEMS.length
	const angle = itemIndex * sliceSize
	const itemX = Math.sin(angle) * WHEEL_RADIUS
	const itemY = -Math.cos(angle) * WHEEL_RADIUS
	return [itemX, itemY]
}
