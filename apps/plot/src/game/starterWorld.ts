import { LOT_SIZE } from './constants'
import { buildEdgeKey, buildTileKey, EdgeAxis, getTilesInRect } from './grid'
import type { EdgeAxisT } from './grid'
import type { PlacedObjectT } from './footprint'
import { createObjectId } from './ids'

type StarterWorldT = {
	floors: Record<string, string>
	walls: Record<string, string>
	objects: PlacedObjectT[]
}

const buildIndexRange = (from: number, toExclusive: number): number[] => {
	const length = Math.max(0, toExclusive - from)
	return Array.from({ length }, (_unused, offset) => from + offset)
}

const paintRect = (floors: Record<string, string>, fromX: number, fromZ: number, toX: number, toZ: number, floorId: string): void => {
	const tiles = getTilesInRect({ x: fromX, z: fromZ }, { x: toX, z: toZ })
	for (const tile of tiles) floors[buildTileKey(tile)] = floorId
}

const addWallRun = (walls: Record<string, string>, axis: EdgeAxisT, fixed: number, from: number, toExclusive: number, wallId: string, gaps: number[]): void => {
	const positions = buildIndexRange(from, toExclusive)
	const isAlongX = axis === EdgeAxis.x

	for (const position of positions) {
		const isGap = gaps.includes(position)
		if (isGap) continue
		const edgeX = isAlongX ? position : fixed
		const edgeZ = isAlongX ? fixed : position
		walls[buildEdgeKey({ axis, x: edgeX, z: edgeZ })] = wallId
	}
}

const placeStarterObject = (defId: string, x: number, z: number, rotation: number): PlacedObjectT => {
	return { id: createObjectId(), defId, x, z, rotation }
}

// A little cottage so the first screen is not an empty lawn.
export const buildStarterWorld = (): StarterWorldT => {
	const floors: Record<string, string> = {}
	const walls: Record<string, string> = {}

	paintRect(floors, 3, 3, 7, 8, 'oak')
	paintRect(floors, 3, 6, 4, 8, 'checker')
	paintRect(floors, 8, 3, 10, 8, 'plum')
	paintRect(floors, 5, 9, 5, LOT_SIZE - 1, 'slate')
	paintRect(floors, 12, 10, 13, LOT_SIZE - 1, 'concrete')

	addWallRun(walls, EdgeAxis.x, 3, 3, 11, 'plaster', [])
	addWallRun(walls, EdgeAxis.x, 9, 3, 11, 'plaster', [5])
	addWallRun(walls, EdgeAxis.z, 3, 3, 9, 'plaster', [])
	addWallRun(walls, EdgeAxis.z, 11, 3, 9, 'plaster', [])
	addWallRun(walls, EdgeAxis.z, 8, 3, 9, 'sage', [6, 7])
	addWallRun(walls, EdgeAxis.x, LOT_SIZE, 0, LOT_SIZE, 'picket', [5, 12, 13])

	const objects: PlacedObjectT[] = [
		placeStarterObject('rococoRoyal', 4, 3, 0),
		placeStarterObject('lamp', 6, 3, 0),
		placeStarterObject('armchair', 6, 5, 3),
		placeStarterObject('bookshelf', 3, 4, 1),
		placeStarterObject('diningTable', 3, 7, 0),
		placeStarterObject('chair', 3, 6, 0),
		placeStarterObject('pottedPlant', 7, 8, 0),
		placeStarterObject('bed', 9, 3, 0),
		placeStarterObject('lamp', 10, 3, 0),
		placeStarterObject('bookshelf', 10, 7, 3),
		placeStarterObject('oakTree', 13, 4, 0),
		placeStarterObject('pineTree', 1, 2, 0),
		placeStarterObject('pineTree', 1, 11, 1),
		placeStarterObject('birchTree', 14, 9, 0),
		placeStarterObject('cherryTree', 7, 13, 0),
		placeStarterObject('cruiserRed', 12, 11, 0),
		placeStarterObject('palmTree', 9, 13, 0),
		placeStarterObject('bush', 3, 10, 0),
		placeStarterObject('bush', 8, 10, 1),
		placeStarterObject('flowers', 4, 10, 0),
		placeStarterObject('flowers', 6, 10, 0),
		placeStarterObject('flowers', 7, 10, 0)
	]

	return { floors, walls, objects }
}
