// Floor and wall tools draw with a drag. The place tool drops
// whatever object is chosen in the build menu.
export const ToolId = {
	look: 'look',
	floor: 'floor',
	wall: 'wall',
	place: 'place',
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
	sofa: 'sofa',
	furniture: 'furniture',
	vehicle: 'vehicle'
} as const

export type ObjectCategoryT = (typeof ObjectCategory)[keyof typeof ObjectCategory]

// The build menu's tabs: two drawing kinds plus every object
// category.
export const MenuCategory = {
	floors: 'floors',
	walls: 'walls',
	plant: 'plant',
	sofa: 'sofa',
	furniture: 'furniture',
	vehicle: 'vehicle'
} as const

export type MenuCategoryT = (typeof MenuCategory)[keyof typeof MenuCategory]

export type FloorDefT = {
	id: string
	label: string
	color: string
	accentColor: string
	pattern: FloorPatternT
}

export type WallDefT = {
	id: string
	label: string
	color: string
	trimColor: string
	style: WallStyleT
}

// width runs along local X, depth along local Z, both in tiles.
// Models face +Z. accentSwatch is an optional second color for
// the menu card (gold frame, white roof).
export type ObjectDefT = {
	id: string
	label: string
	category: ObjectCategoryT
	width: number
	depth: number
	swatch: string
	accentSwatch?: string
}

export const floorDefs: FloorDefT[] = [
	{ id: 'oak', label: 'Oak planks', color: '#b9875a', accentColor: '#8d6240', pattern: 'planks' },
	{ id: 'walnut', label: 'Walnut', color: '#6e4b33', accentColor: '#4f3423', pattern: 'planks' },
	{ id: 'checker', label: 'Checker tile', color: '#ece6da', accentColor: '#2f3640', pattern: 'tiles' },
	{ id: 'terracotta', label: 'Terracotta', color: '#c46d4a', accentColor: '#a85a3b', pattern: 'tiles' },
	{ id: 'slate', label: 'Slate', color: '#7d8590', accentColor: '#5d646d', pattern: 'stone' },
	{ id: 'concrete', label: 'Concrete', color: '#b9b6ae', accentColor: '#9c998f', pattern: 'stone' },
	{ id: 'asphalt', label: 'Asphalt', color: '#4b4e53', accentColor: '#3d4044', pattern: 'carpet' },
	{ id: 'moss', label: 'Moss carpet', color: '#6f8f63', accentColor: '#5f7d54', pattern: 'carpet' },
	{ id: 'plum', label: 'Plum carpet', color: '#7c5a86', accentColor: '#6a4b73', pattern: 'carpet' }
]

export const wallDefs: WallDefT[] = [
	{ id: 'plaster', label: 'Plaster', color: '#efe7d8', trimColor: '#d8ccb6', style: 'solid' },
	{ id: 'sage', label: 'Sage paint', color: '#a9bfa2', trimColor: '#8ea586', style: 'solid' },
	{ id: 'brick', label: 'Red brick', color: '#a4523d', trimColor: '#d9cbb8', style: 'brick' },
	{ id: 'picket', label: 'Picket fence', color: '#f4f1ea', trimColor: '#dcd6ca', style: 'fence' }
]

export const objectDefs: ObjectDefT[] = [
	{ id: 'oakTree', label: 'Oak', category: 'plant', width: 1, depth: 1, swatch: '#4f8a3c' },
	{ id: 'pineTree', label: 'Pine', category: 'plant', width: 1, depth: 1, swatch: '#2f6b47' },
	{ id: 'birchTree', label: 'Birch', category: 'plant', width: 1, depth: 1, swatch: '#b8c95a' },
	{ id: 'palmTree', label: 'Palm', category: 'plant', width: 1, depth: 1, swatch: '#5aa36a' },
	{ id: 'cherryTree', label: 'Cherry', category: 'plant', width: 1, depth: 1, swatch: '#e7a1b8' },
	{ id: 'bush', label: 'Bush', category: 'plant', width: 1, depth: 1, swatch: '#3f7d3a' },
	{ id: 'flowers', label: 'Flower bed', category: 'plant', width: 1, depth: 1, swatch: '#e6c14f' },
	{ id: 'pottedPlant', label: 'Potted plant', category: 'plant', width: 1, depth: 1, swatch: '#5f9a55', accentSwatch: '#c46d4a' },

	{ id: 'rococoRoyal', label: 'Rococo throne, royal blue', category: 'sofa', width: 2, depth: 1, swatch: '#1f4fa3', accentSwatch: '#d9b45a' },
	{ id: 'rococoEmerald', label: 'Rococo throne, emerald', category: 'sofa', width: 2, depth: 1, swatch: '#1d6b4f', accentSwatch: '#d9b45a' },
	{ id: 'rococoBlush', label: 'Rococo throne, blush', category: 'sofa', width: 2, depth: 1, swatch: '#d99aa5', accentSwatch: '#e8e2d6' },
	{ id: 'sectionalBlush', label: 'Tufted sectional, rose', category: 'sofa', width: 3, depth: 2, swatch: '#c98579', accentSwatch: '#efe6d6' },
	{ id: 'sectionalNavy', label: 'Tufted sectional, navy', category: 'sofa', width: 3, depth: 2, swatch: '#24356b', accentSwatch: '#efe6d6' },
	{ id: 'sectionalIvory', label: 'Tufted sectional, ivory', category: 'sofa', width: 3, depth: 2, swatch: '#e9e1d2', accentSwatch: '#9c8a74' },
	{ id: 'sofa', label: 'Modern sofa', category: 'sofa', width: 2, depth: 1, swatch: '#5b7bb5' },
	{ id: 'armchair', label: 'Armchair', category: 'sofa', width: 1, depth: 1, swatch: '#c47a52' },

	{ id: 'diningTable', label: 'Dining table', category: 'furniture', width: 2, depth: 1, swatch: '#9a6a43' },
	{ id: 'chair', label: 'Chair', category: 'furniture', width: 1, depth: 1, swatch: '#b48a5e' },
	{ id: 'bed', label: 'Bed', category: 'furniture', width: 1, depth: 2, swatch: '#e9e4f2', accentSwatch: '#9b7fd6' },
	{ id: 'bookshelf', label: 'Bookshelf', category: 'furniture', width: 1, depth: 1, swatch: '#7a5236' },
	{ id: 'lamp', label: 'Floor lamp', category: 'furniture', width: 1, depth: 1, swatch: '#f3d27a', accentSwatch: '#2e2e33' },

	{ id: 'cruiserRed', label: 'Vintage 4x4, red hardtop', category: 'vehicle', width: 2, depth: 4, swatch: '#c22a22', accentSwatch: '#f2efe8' },
	{ id: 'cruiserSage', label: 'Vintage 4x4, sage hardtop', category: 'vehicle', width: 2, depth: 4, swatch: '#8fa58a', accentSwatch: '#f2efe8' },
	{ id: 'cruiserSky', label: 'Vintage 4x4, sky open-top', category: 'vehicle', width: 2, depth: 4, swatch: '#7fb2d6', accentSwatch: '#e9dcc4' },
	{ id: 'cruiserSand', label: 'Vintage 4x4, sand pickup', category: 'vehicle', width: 2, depth: 4, swatch: '#d2b48a', accentSwatch: '#f2efe8' },
	{ id: 'cruiserBlack', label: 'Vintage 4x4, black hardtop', category: 'vehicle', width: 2, depth: 4, swatch: '#1d1f22', accentSwatch: '#d9d4c9' }
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
