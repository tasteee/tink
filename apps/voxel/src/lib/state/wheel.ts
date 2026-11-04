import { TOOL_ACTIONS, TOOL_SHAPES } from './tools'
import type { ToolActionIdT, ToolShapeIdT } from './tools'

export type WheelItemT = {
	id: ToolActionIdT | ToolShapeIdT | 'gallery'
	kind: 'action' | 'shape' | 'gallery'
	label: string
}

const ACTION_ITEMS: WheelItemT[] = TOOL_ACTIONS.map((action) => ({ id: action.id, kind: 'action', label: action.name }))
const SHAPE_ITEMS: WheelItemT[] = TOOL_SHAPES.map((shape) => ({ id: shape.id, kind: 'shape', label: shape.name }))

// Clockwise from the top: actions, then shapes, then gallery.
export const WHEEL_ITEMS: WheelItemT[] = [...ACTION_ITEMS, ...SHAPE_ITEMS, { id: 'gallery', kind: 'gallery', label: 'Gallery' }]

export const WHEEL_RADIUS = 190
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
