import { Armchair, Car, Couch, PaintRoller, Tree, Wall } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import { floorDefs, getFloorDef, getObjectDef, getObjectDefsInCategory, getWallDef, MenuCategory, ObjectCategory, ToolId, wallDefs } from '../game/catalog'
import type { MenuCategoryT, ObjectCategoryT, ToolIdT } from '../game/catalog'
import type { CatalogChoicesT } from '../game/store'

export type MenuCategoryInfoT = {
	id: MenuCategoryT
	label: string
	Icon: Icon
}

export const menuCategories: MenuCategoryInfoT[] = [
	{ id: MenuCategory.sofa, label: 'Sofas', Icon: Couch },
	{ id: MenuCategory.furniture, label: 'Furniture', Icon: Armchair },
	{ id: MenuCategory.vehicle, label: 'Vehicles', Icon: Car },
	{ id: MenuCategory.plant, label: 'Plants', Icon: Tree },
	{ id: MenuCategory.floors, label: 'Floors', Icon: PaintRoller },
	{ id: MenuCategory.walls, label: 'Walls', Icon: Wall }
]

export const getMenuCategoryInfo = (categoryId: string): MenuCategoryInfoT => {
	const foundCategory = menuCategories.find((category) => category.id === categoryId)
	return foundCategory ?? menuCategories[0]
}

// One card in the build menu, whatever kind of thing it is.
export type MenuItemT = {
	id: string
	name: string
	variant: string
	swatch: string
	accentSwatch: string
	tool: ToolIdT
	Icon: Icon
}

const objectCategories: ObjectCategoryT[] = [ObjectCategory.plant, ObjectCategory.sofa, ObjectCategory.furniture, ObjectCategory.vehicle]

// "Rococo throne, royal blue" reads as a name plus a variant.
const splitLabel = (label: string): { name: string; variant: string } => {
	const commaIndex = label.indexOf(', ')
	const hasVariant = commaIndex > -1
	if (!hasVariant) return { name: label, variant: '' }
	return { name: label.slice(0, commaIndex), variant: label.slice(commaIndex + 2) }
}

const buildFloorItems = (): MenuItemT[] => {
	return floorDefs.map((floorDef) => {
		return { id: floorDef.id, name: floorDef.label, variant: 'Drag to paint', swatch: floorDef.color, accentSwatch: floorDef.accentColor, tool: ToolId.floor, Icon: PaintRoller }
	})
}

const buildWallItems = (): MenuItemT[] => {
	return wallDefs.map((wallDef) => {
		return { id: wallDef.id, name: wallDef.label, variant: 'Drag to build', swatch: wallDef.color, accentSwatch: wallDef.trimColor, tool: ToolId.wall, Icon: Wall }
	})
}

const buildObjectItems = (category: ObjectCategoryT): MenuItemT[] => {
	const categoryIcon = getMenuCategoryInfo(category).Icon
	return getObjectDefsInCategory(category).map((objectDef) => {
		const labelParts = splitLabel(objectDef.label)
		const accentSwatch = objectDef.accentSwatch ?? objectDef.swatch
		return { id: objectDef.id, name: labelParts.name, variant: labelParts.variant, swatch: objectDef.swatch, accentSwatch, tool: ToolId.place, Icon: categoryIcon }
	})
}

export const getMenuItems = (categoryId: string): MenuItemT[] => {
	const isFloors = categoryId === MenuCategory.floors
	if (isFloors) return buildFloorItems()
	const isWalls = categoryId === MenuCategory.walls
	if (isWalls) return buildWallItems()

	const objectCategory = objectCategories.find((category) => category === categoryId)
	if (objectCategory === undefined) return []
	return buildObjectItems(objectCategory)
}

export type ActiveChoiceT = {
	label: string
	swatch: string
	hint: string
}

// What the floor, wall or place tool is currently holding.
export const getActiveChoice = (tool: ToolIdT, choices: CatalogChoicesT): ActiveChoiceT | null => {
	const isFloorTool = tool === ToolId.floor
	if (isFloorTool) {
		const floorDef = getFloorDef(choices.floor)
		return { label: floorDef.label, swatch: floorDef.color, hint: 'Drag across tiles to paint' }
	}

	const isWallTool = tool === ToolId.wall
	if (isWallTool) {
		const wallDef = getWallDef(choices.wall)
		return { label: wallDef.label, swatch: wallDef.color, hint: 'Drag along grid lines' }
	}

	const isPlaceTool = tool === ToolId.place
	if (!isPlaceTool) return null
	const objectDef = getObjectDef(choices.object)
	return { label: objectDef.label, swatch: objectDef.swatch, hint: 'Tap the lot to place' }
}
