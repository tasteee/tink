import type { ActionIdT } from './keymap.svelte'

// A tool is an ACTION (what happens) plus a SHAPE (which voxels
// it touches). Extrude, object and pivot are actions that
// ignore the shape.

export type ToolActionIdT = 'place' | 'erase' | 'paint' | 'select' | 'extrude' | 'object' | 'pivot'
export type ToolShapeIdT = 'block' | 'line' | 'square' | 'fill' | 'stamp'

export type ToolActionInfoT = {
	id: ToolActionIdT
	name: string
	hint: string
	keyActionId: ActionIdT
	takesShape: boolean
}

export type ToolShapeInfoT = {
	id: ToolShapeIdT
	name: string
	hint: string
	keyActionId: ActionIdT
}

export const TOOL_ACTIONS: ToolActionInfoT[] = [
	{ id: 'place', name: 'Place', hint: 'Place', keyActionId: 'actionPlace', takesShape: true },
	{ id: 'erase', name: 'Erase', hint: 'Erase', keyActionId: 'actionErase', takesShape: true },
	{ id: 'paint', name: 'Paint', hint: 'Paint', keyActionId: 'actionPaint', takesShape: true },
	{ id: 'select', name: 'Select', hint: 'Select', keyActionId: 'actionSelect', takesShape: true },
	{ id: 'extrude', name: 'Extrude', hint: 'Hold on a face, drag up to grow, drag down to shrink', keyActionId: 'actionExtrude', takesShape: false },
	{ id: 'object', name: 'Object', hint: 'Click to select a group, arrows move, R rotates', keyActionId: 'actionObject', takesShape: false },
	{ id: 'pivot', name: 'Pivot', hint: 'Click a voxel to snap the pivot, arrows nudge', keyActionId: 'actionPivot', takesShape: false }
]

export const TOOL_SHAPES: ToolShapeInfoT[] = [
	{ id: 'block', name: 'Block', hint: 'click a voxel', keyActionId: 'shapeBlock' },
	{ id: 'line', name: 'Line', hint: 'click start, click end', keyActionId: 'shapeLine' },
	{ id: 'square', name: 'Square', hint: 'click two corners', keyActionId: 'shapeSquare' },
	{ id: 'fill', name: 'Fill', hint: 'click a voxel to take every connected voxel of its color, or the selection', keyActionId: 'shapeFill' },
	{ id: 'stamp', name: 'Stamp', hint: 'hold and drag to set the depth of the prefab', keyActionId: 'shapeStamp' }
]

const ALLOWED_ACTIONS_BY_SHAPE: Record<ToolShapeIdT, ToolActionIdT[]> = {
	block: ['place', 'erase', 'paint', 'select'],
	line: ['place', 'erase', 'paint', 'select'],
	square: ['place', 'erase', 'paint', 'select'],
	fill: ['erase', 'paint', 'select'],
	stamp: ['place', 'erase']
}

export const findToolAction = (actionId: ToolActionIdT): ToolActionInfoT => {
	const foundAction = TOOL_ACTIONS.find((action) => action.id === actionId)
	return foundAction ?? TOOL_ACTIONS[0]
}

export const findToolShape = (shapeId: ToolShapeIdT): ToolShapeInfoT => {
	const foundShape = TOOL_SHAPES.find((shape) => shape.id === shapeId)
	return foundShape ?? TOOL_SHAPES[0]
}

export const checkActionTakesShape = (actionId: ToolActionIdT): boolean => {
	return findToolAction(actionId).takesShape
}

export const checkIsShapeAllowed = (actionId: ToolActionIdT, shapeId: ToolShapeIdT): boolean => {
	return ALLOWED_ACTIONS_BY_SHAPE[shapeId].includes(actionId)
}

export const checkIsStampActive = (actionId: ToolActionIdT, shapeId: ToolShapeIdT): boolean => {
	const takesShape = checkActionTakesShape(actionId)
	return takesShape && shapeId === 'stamp'
}

export const getShapeAllowedLabel = (shapeId: ToolShapeIdT): string => {
	const allowedActionIds = ALLOWED_ACTIONS_BY_SHAPE[shapeId]
	const allowedNames = allowedActionIds.map((actionId) => findToolAction(actionId).name)
	return `${findToolShape(shapeId).name} works with ${allowedNames.join(', ')}`
}

export const getToolHint = (actionId: ToolActionIdT, shapeId: ToolShapeIdT): string => {
	const action = findToolAction(actionId)
	if (!action.takesShape) return action.hint
	const shape = findToolShape(shapeId)
	return `${action.hint}: ${shape.hint}`
}
