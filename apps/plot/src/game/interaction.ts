import { ToolId } from './catalog'
import type { ToolIdT } from './catalog'
import { buildWalls, findObjectAtTile, paintFloors, placeObject, removeFloor, removeObject } from './actions'
import { getAnchorForTile } from './footprint'
import { getEdgesOnLine, getTilesInRect, isTileInLot, worldToRawTile, worldToTile, worldToVertex } from './grid'
import { $choices, $hover, $placementRotation, $selectedObjectId, $stroke, $world, getActiveTool, StrokeKind } from './store'

// Floor and wall tools draw with a one-finger drag. Every
// other tool leaves one finger free for panning the camera.
export const checkIsDrawingTool = (tool: ToolIdT): boolean => {
	const isFloorTool = tool === ToolId.floor
	const isWallTool = tool === ToolId.wall
	return isFloorTool || isWallTool
}

export const startStroke = (worldX: number, worldZ: number): void => {
	const tool = getActiveTool()
	const isFloorTool = tool === ToolId.floor
	if (isFloorTool) {
		const tile = worldToTile(worldX, worldZ)
		$stroke.set({ kind: StrokeKind.floor, startX: tile.x, startZ: tile.z, endX: tile.x, endZ: tile.z })
		return
	}

	const isWallTool = tool === ToolId.wall
	if (!isWallTool) return
	const vertex = worldToVertex(worldX, worldZ)
	$stroke.set({ kind: StrokeKind.wall, startX: vertex.x, startZ: vertex.z, endX: vertex.x, endZ: vertex.z })
}

export const updateStroke = (worldX: number, worldZ: number): void => {
	const stroke = $stroke.state
	const isFloorStroke = stroke.kind === StrokeKind.floor
	const isWallStroke = stroke.kind === StrokeKind.wall
	const isActive = isFloorStroke || isWallStroke
	if (!isActive) return

	const point = isFloorStroke ? worldToTile(worldX, worldZ) : worldToVertex(worldX, worldZ)
	const isUnchanged = point.x === stroke.endX && point.z === stroke.endZ
	if (isUnchanged) return
	$stroke.set({ endX: point.x, endZ: point.z })
}

export const cancelStroke = (): void => {
	$stroke.set({ kind: StrokeKind.none })
}

export const finishStroke = (): void => {
	const stroke = $stroke.state
	const start = { x: stroke.startX, z: stroke.startZ }
	const end = { x: stroke.endX, z: stroke.endZ }
	cancelStroke()

	const isFloorStroke = stroke.kind === StrokeKind.floor
	if (isFloorStroke) {
		paintFloors(getTilesInRect(start, end), $choices.state.floor)
		return
	}

	const isWallStroke = stroke.kind === StrokeKind.wall
	if (!isWallStroke) return
	buildWalls(getEdgesOnLine(start, end), $choices.state.wall)
}

// A tap on open ground: place, demolish, or clear selection.
export const handleGroundTap = (worldX: number, worldZ: number): void => {
	const tool = getActiveTool()
	const tile = worldToRawTile(worldX, worldZ)
	const isInLot = isTileInLot(tile)

	const objectOnTile = findObjectAtTile($world.state, tile)
	const hasObjectOnTile = objectOnTile !== undefined
	const selectedId = hasObjectOnTile ? objectOnTile.id : ''

	const isLookTool = tool === ToolId.look
	if (isLookTool) {
		$selectedObjectId.set(selectedId)
		return
	}

	const isBulldozeTool = tool === ToolId.bulldoze
	if (isBulldozeTool) {
		if (hasObjectOnTile) {
			removeObject(objectOnTile.id)
			return
		}
		if (isInLot) removeFloor(tile)
		return
	}

	const isPlaceTool = tool === ToolId.place
	if (!isPlaceTool) return
	if (!isInLot) return

	const defId = $choices.state.object
	const rotation = $placementRotation.state
	const anchor = getAnchorForTile(defId, tile, rotation)
	placeObject(defId, anchor, rotation)
}

export const updateHover = (worldX: number, worldZ: number): void => {
	const tile = worldToRawTile(worldX, worldZ)
	const isInLot = isTileInLot(tile)
	const hover = $hover.state
	const isUnchanged = hover.isVisible === isInLot && hover.x === tile.x && hover.z === tile.z
	if (isUnchanged) return
	$hover.set({ isVisible: isInLot, x: tile.x, z: tile.z })
}

export const hideHover = (): void => {
	const isAlreadyHidden = !$hover.state.isVisible
	if (isAlreadyHidden) return
	$hover.set({ isVisible: false })
}

