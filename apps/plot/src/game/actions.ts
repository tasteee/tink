import { MAX_HISTORY } from './constants'
import { buildEdgeKey, buildTileKey } from './grid'
import type { EdgeT, TileT } from './grid'
import { getFootprintTiles, getInternalEdgeKeys, isFootprintInLot } from './footprint'
import type { PlacedObjectT } from './footprint'
import { createObjectId } from './ids'
import { buildStarterWorld } from './starterWorld'
import { $historySize, $notice, $selectedObjectId, $world } from './store'
import type { WorldT } from './store'

const history: WorldT[] = []

export const showNotice = (message: string): void => {
	$notice.set({ message, stamp: Date.now() })
}

const commitWorld = (nextWorld: WorldT): void => {
	history.push($world.state)
	const isHistoryTooLong = history.length > MAX_HISTORY
	if (isHistoryTooLong) history.shift()
	$world.set.replace(nextWorld)
	$historySize.set(history.length)
}

export const undo = (): void => {
	const previousWorld = history.pop()
	if (previousWorld === undefined) return
	$world.set.replace(previousWorld)
	$historySize.set(history.length)
	$selectedObjectId.set('')
}

export const resetLot = (): void => {
	commitWorld(buildStarterWorld())
	$selectedObjectId.set('')
}

const getOccupiedTileKeys = (objects: PlacedObjectT[], ignoredObjectId: string): Set<string> => {
	const occupiedKeys = new Set<string>()

	for (const placedObject of objects) {
		const isIgnored = placedObject.id === ignoredObjectId
		if (isIgnored) continue
		const tiles = getFootprintTiles(placedObject.defId, placedObject, placedObject.rotation)
		for (const tile of tiles) occupiedKeys.add(buildTileKey(tile))
	}

	return occupiedKeys
}

const getBlockedEdgeKeys = (objects: PlacedObjectT[]): Set<string> => {
	const blockedKeys = new Set<string>()

	for (const placedObject of objects) {
		const tiles = getFootprintTiles(placedObject.defId, placedObject, placedObject.rotation)
		const internalKeys = getInternalEdgeKeys(tiles)
		for (const edgeKey of internalKeys) blockedKeys.add(edgeKey)
	}

	return blockedKeys
}

// Taps on the ground under a thin trunk or chair leg still
// find the object standing on that tile.
export const findObjectAtTile = (world: WorldT, tile: TileT): PlacedObjectT | undefined => {
	const tileKey = buildTileKey(tile)
	return world.objects.find((placedObject) => {
		const tiles = getFootprintTiles(placedObject.defId, placedObject, placedObject.rotation)
		return tiles.some((footprintTile) => buildTileKey(footprintTile) === tileKey)
	})
}

export const PlacementProblem = {
	none: 'none',
	outsideLot: 'outsideLot',
	occupied: 'occupied',
	wallInTheWay: 'wallInTheWay'
} as const

export type PlacementProblemT = (typeof PlacementProblem)[keyof typeof PlacementProblem]

const placementMessages: Record<PlacementProblemT, string> = {
	none: '',
	outsideLot: 'That does not fit on the lot',
	occupied: 'Something is already there',
	wallInTheWay: 'A wall is in the way'
}

export const checkPlacement = (world: WorldT, defId: string, anchor: TileT, rotation: number, ignoredObjectId: string): PlacementProblemT => {
	const tiles = getFootprintTiles(defId, anchor, rotation)
	const isInLot = isFootprintInLot(tiles)
	if (!isInLot) return PlacementProblem.outsideLot

	const occupiedKeys = getOccupiedTileKeys(world.objects, ignoredObjectId)
	const isOccupied = tiles.some((tile) => occupiedKeys.has(buildTileKey(tile)))
	if (isOccupied) return PlacementProblem.occupied

	const internalEdgeKeys = getInternalEdgeKeys(tiles)
	const isWallInTheWay = internalEdgeKeys.some((edgeKey) => edgeKey in world.walls)
	if (isWallInTheWay) return PlacementProblem.wallInTheWay

	return PlacementProblem.none
}

export const placeObject = (defId: string, anchor: TileT, rotation: number): void => {
	const world = $world.state
	const problem = checkPlacement(world, defId, anchor, rotation, '')
	const hasProblem = problem !== PlacementProblem.none
	if (hasProblem) {
		showNotice(placementMessages[problem])
		return
	}

	const newObject: PlacedObjectT = { id: createObjectId(), defId, x: anchor.x, z: anchor.z, rotation }
	const nextObjects = [...world.objects, newObject]
	commitWorld({ ...world, objects: nextObjects })
}

export const rotateObject = (objectId: string): void => {
	const world = $world.state
	const targetObject = world.objects.find((placedObject) => placedObject.id === objectId)
	if (targetObject === undefined) return

	const nextRotation = (targetObject.rotation + 1) % 4
	const problem = checkPlacement(world, targetObject.defId, targetObject, nextRotation, objectId)
	const hasProblem = problem !== PlacementProblem.none
	if (hasProblem) {
		showNotice(placementMessages[problem])
		return
	}

	const nextObjects = world.objects.map((placedObject) => {
		const isTarget = placedObject.id === objectId
		if (!isTarget) return placedObject
		return { ...placedObject, rotation: nextRotation }
	})
	commitWorld({ ...world, objects: nextObjects })
}

export const removeObject = (objectId: string): void => {
	const world = $world.state
	const targetObject = world.objects.find((placedObject) => placedObject.id === objectId)
	if (targetObject === undefined) return

	const nextObjects = world.objects.filter((placedObject) => placedObject.id !== objectId)
	commitWorld({ ...world, objects: nextObjects })

	const wasSelected = $selectedObjectId.state === objectId
	if (wasSelected) $selectedObjectId.set('')
}

export const paintFloors = (tiles: TileT[], floorId: string): void => {
	const world = $world.state
	const changedTileKeys = tiles.map(buildTileKey).filter((tileKey) => world.floors[tileKey] !== floorId)
	const hasChanges = changedTileKeys.length > 0
	if (!hasChanges) return

	const nextFloors = { ...world.floors }
	for (const tileKey of changedTileKeys) nextFloors[tileKey] = floorId
	commitWorld({ ...world, floors: nextFloors })
}

export const removeFloor = (tile: TileT): void => {
	const world = $world.state
	const tileKey = buildTileKey(tile)
	const floorId = world.floors[tileKey]
	if (floorId === undefined) return

	const nextFloors = { ...world.floors }
	delete nextFloors[tileKey]
	commitWorld({ ...world, floors: nextFloors })
}

export const buildWalls = (edges: EdgeT[], wallId: string): void => {
	const world = $world.state
	const blockedEdgeKeys = getBlockedEdgeKeys(world.objects)
	const edgeKeys = edges.map(buildEdgeKey)
	const openEdgeKeys = edgeKeys.filter((edgeKey) => !blockedEdgeKeys.has(edgeKey))
	const changedEdgeKeys = openEdgeKeys.filter((edgeKey) => world.walls[edgeKey] !== wallId)
	const wasBlocked = openEdgeKeys.length < edgeKeys.length
	if (wasBlocked) showNotice('Skipped walls that cut through objects')

	const hasChanges = changedEdgeKeys.length > 0
	if (!hasChanges) return

	const nextWalls = { ...world.walls }
	for (const edgeKey of changedEdgeKeys) nextWalls[edgeKey] = wallId
	commitWorld({ ...world, walls: nextWalls })
}

export const removeWall = (edgeKey: string): void => {
	const world = $world.state
	const wallId = world.walls[edgeKey]
	if (wallId === undefined) return

	const nextWalls = { ...world.walls }
	delete nextWalls[edgeKey]
	commitWorld({ ...world, walls: nextWalls })
}
