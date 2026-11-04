import type { ActionIdT } from './keymap.svelte'

export type ToolIdT = 'block' | 'line' | 'square' | 'extrude' | 'stamp' | 'select' | 'object' | 'pivot' | 'paint'

export type ToolInfoT = {
	id: ToolIdT
	name: string
	hint: string
	deleteHint: string
	actionId: ActionIdT
	isBuildTool: boolean
}

export const TOOLS: ToolInfoT[] = [
	{ id: 'block', name: 'Block', hint: 'Place one voxel', deleteHint: 'Remove one voxel', actionId: 'tool1', isBuildTool: true },
	{ id: 'line', name: 'Line', hint: 'Click start, click end', deleteHint: 'Remove a line', actionId: 'tool2', isBuildTool: true },
	{ id: 'square', name: 'Square', hint: 'Click two corners', deleteHint: 'Remove a rectangle', actionId: 'tool3', isBuildTool: true },
	{ id: 'extrude', name: 'Extrude', hint: 'Hold on a face, drag up to grow', deleteHint: 'Hold on a face, drag down to shrink', actionId: 'tool4', isBuildTool: true },
	{ id: 'stamp', name: 'Stamp', hint: 'Place a prefab, hold and drag to extrude', deleteHint: 'Carve the prefab shape', actionId: 'tool5', isBuildTool: true },
	{ id: 'select', name: 'Select', hint: 'Click a voxel, double-click for connected', deleteHint: 'Click a voxel, double-click for connected', actionId: 'tool6', isBuildTool: false },
	{ id: 'object', name: 'Object', hint: 'Click to select a group, arrows move, R rotates', deleteHint: 'Click to select a group', actionId: 'tool7', isBuildTool: false },
	{ id: 'pivot', name: 'Pivot', hint: 'Click a voxel to snap the pivot, arrows nudge', deleteHint: 'Click a voxel to snap the pivot', actionId: 'tool8', isBuildTool: false },
	{ id: 'paint', name: 'Paint bucket', hint: 'Fill connected voxels of one color. Inside a selection: fills the selection', deleteHint: 'Erase all connected voxels of one color. Inside a selection: deletes the selection', actionId: 'tool9', isBuildTool: false }
]

export const findTool = (toolId: ToolIdT): ToolInfoT => {
	const foundTool = TOOLS.find((tool) => tool.id === toolId)
	return foundTool ?? TOOLS[0]
}
