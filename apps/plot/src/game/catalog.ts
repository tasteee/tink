export const ToolId = {
	look: 'look',
	floor: 'floor',
	wall: 'wall',
	plant: 'plant',
	furniture: 'furniture',
	bulldoze: 'bulldoze'
} as const

export type ToolIdT = (typeof ToolId)[keyof typeof ToolId]

export const FloorPattern = {
	planks: 'planks',
	tiles: 'tiles',
	stone: 'stone',
	carpet: 'carpet'
} as const

export type FloorPatternT = (typeof FloorPattern)[keyof typeof FloorPattern]

export const WallStyle = {
	solid: 'solid',
	brick: 'brick',
	fence: 'fence'
} as const

export type WallStyleT = (typeof WallStyle)[keyof typeof WallStyle]

export const ObjectCategory = {
	plant: 'plant',
	furniture: 'furniture'
} as const

export type ObjectCategoryT = (typeof ObjectCategory)[keyof typeof ObjectCategory]

export type FloorDefT = {
	id: string
	label: string
	cost: number
	color: string
	accentColor: string
	pattern: FloorPatternT
}

export type WallDefT = {
	id: string
	label: string
	cost: number
	color: string
	trimColor: string
	style: WallStyleT
}

// width runs along local X, depth along local Z, both in tiles.
export type ObjectDefT = {
	id: string
	label: string
	category: ObjectCategoryT
	cost: number
	width: number
	depth: number
	swatch: string
}

export const floorDefs: FloorDefT[] = [
	{ id: 'oak', label: 'Oak planks', cost: 10, color: '#b9875a', accentColor: '#8d6240', pattern: 'planks' },
	{ id: 'walnut', label: 'Walnut', cost: 14, color: '#6e4b33', accentColor: '#4f3423', pattern: 'planks' },
	{ id: 'checker', label: 'Checker tile', cost: 12, color: '#ece6da', accentColor: '#2f3640', pattern: 'tiles' },
	{ id: 'terracotta', label: 'Terracotta', cost: 12, color: '#c46d4a', accentColor: '#a85a3b', pattern: 'tiles' },
	{ id: 'slate', label: 'Slate', cost: 16, color: '#7d8590', accentColor: '#5d646d', pattern: 'stone' },
	{ id: 'moss', label: 'Moss carpet', cost: 8, color: '#6f8f63', accentColor: '#5f7d54', pattern: 'carpet' },
	{ id: 'plum', label: 'Plum carpet', cost: 8, color: '#7c5a86', accentColor: '#6a4b73', pattern: 'carpet' }
]

export const wallDefs: WallDefT[] = [
	{ id: 'plaster', label: 'Plaster', cost: 40, color: '#efe7d8', trimColor: '#d8ccb6', style: 'solid' },
	{ id: 'sage', label: 'Sage paint', cost: 45, color: '#a9bfa2', trimColor: '#8ea586', style: 'solid' },
	{ id: 'brick', label: 'Red brick', cost: 60, color: '#a4523d', trimColor: '#d9cbb8', style: 'brick' },
	{ id: 'picket', label: 'Picket fence', cost: 20, color: '#f4f1ea', trimColor: '#dcd6ca', style: 'fence' }
]

export const objectDefs: ObjectDefT[] = [
	{ id: 'oakTree', label: 'Oak', category: 'plant', cost: 150, width: 1, depth: 1, swatch: '#4f8a3c' },
	{ id: 'pineTree', label: 'Pine', category: 'plant', cost: 120, width: 1, depth: 1, swatch: '#2f6b47' },
	{ id: 'birchTree', label: 'Birch', category: 'plant', cost: 140, width: 1, depth: 1, swatch: '#b8c95a' },
	{ id: 'palmTree', label: 'Palm', category: 'plant', cost: 180, width: 1, depth: 1, swatch: '#5aa36a' },
	{ id: 'cherryTree', label: 'Cherry', category: 'plant', cost: 200, width: 1, depth: 1, swatch: '#e7a1b8' },
	{ id: 'bush', label: 'Bush', category: 'plant', cost: 40, width: 1, depth: 1, swatch: '#3f7d3a' },
	{ id: 'flowers', label: 'Flower bed', cost: 30, category: 'plant', width: 1, depth: 1, swatch: '#e6c14f' },
	{ id: 'sofa', label: 'Sofa', category: 'furniture', cost: 450, width: 2, depth: 1, swatch: '#5b7bb5' },
	{ id: 'armchair', label: 'Armchair', category: 'furniture', cost: 220, width: 1, depth: 1, swatch: '#c47a52' },
	{ id: 'diningTable', label: 'Table', category: 'furniture', cost: 300, width: 2, depth: 1, swatch: '#9a6a43' },
	{ id: 'chair', label: 'Chair', category: 'furniture', cost: 80, width: 1, depth: 1, swatch: '#b48a5e' },
	{ id: 'bed', label: 'Bed', category: 'furniture', cost: 600, width: 1, depth: 2, swatch: '#e9e4f2' },
	{ id: 'bookshelf', label: 'Bookshelf', category: 'furniture', cost: 260, width: 1, depth: 1, swatch: '#7a5236' },
	{ id: 'lamp', label: 'Floor lamp', category: 'furniture', cost: 90, width: 1, depth: 1, swatch: '#f3d27a' },
	{ id: 'pottedPlant', label: 'Potted plant', category: 'furniture', cost: 60, width: 1, depth: 1, swatch: '#5f9a55' }
]

const fallbackFloorDef = floorDefs[0]
const fallbackWallDef = wallDefs[0]
const fallbackObjectDef = objectDefs[0]

export const getFloorDef = (floorId: string): FloorDefT => {
	const foundDef = floorDefs.find((floorDef) => floorDef.id === floorId)
	return foundDef ?? fallbackFloorDef
}

export const getWallDef = (wallId: string): WallDefT => {
	const foundDef = wallDefs.find((wallDef) => wallDef.id === wallId)
	return foundDef ?? fallbackWallDef
}

export const getObjectDef = (objectDefId: string): ObjectDefT => {
	const foundDef = objectDefs.find((objectDef) => objectDef.id === objectDefId)
	return foundDef ?? fallbackObjectDef
}

export const getObjectDefsInCategory = (category: ObjectCategoryT): ObjectDefT[] => {
	return objectDefs.filter((objectDef) => objectDef.category === category)
}
