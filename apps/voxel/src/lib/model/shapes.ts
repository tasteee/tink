import { FACE_NORMALS, addVec, checkIsInsideRoom, getNormalAxis, getTangentAxes, range, toCellKeyFromVec } from './cellKey'
import type { Vec3T } from './types'

// Straight line between two cells, one cell per step along
// the longest axis.
export const buildLineCells = (start: Vec3T, end: Vec3T): Vec3T[] => {
	const deltaX = end[0] - start[0]
	const deltaY = end[1] - start[1]
	const deltaZ = end[2] - start[2]
	const stepCount = Math.max(Math.abs(deltaX), Math.abs(deltaY), Math.abs(deltaZ))
	const isSingleCell = stepCount === 0
	if (isSingleCell) return [[...start]]

	return range(stepCount + 1).map((stepIndex) => {
		const progress = stepIndex / stepCount
		const cellX = Math.round(start[0] + deltaX * progress)
		const cellY = Math.round(start[1] + deltaY * progress)
		const cellZ = Math.round(start[2] + deltaZ * progress)
		const cell: Vec3T = [cellX, cellY, cellZ]
		return cell
	})
}

// Snaps the second corner onto the first corner's plane.
export const projectOntoPlane = (anchor: Vec3T, normal: Vec3T, target: Vec3T): Vec3T => {
	const normalAxis = getNormalAxis(normal)
	const projected: Vec3T = [...target]
	projected[normalAxis] = anchor[normalAxis]
	return projected
}

// Filled rectangle between two corners on the same plane.
export const buildRectangleCells = (anchor: Vec3T, normal: Vec3T, target: Vec3T): Vec3T[] => {
	const corner = projectOntoPlane(anchor, normal, target)
	const tangentAxes = getTangentAxes(normal)
	const firstAxis = tangentAxes[0]
	const secondAxis = tangentAxes[1]
	const firstMin = Math.min(anchor[firstAxis], corner[firstAxis])
	const firstMax = Math.max(anchor[firstAxis], corner[firstAxis])
	const secondMin = Math.min(anchor[secondAxis], corner[secondAxis])
	const secondMax = Math.max(anchor[secondAxis], corner[secondAxis])
	const cells: Vec3T[] = []

	for (const firstOffset of range(firstMax - firstMin + 1)) {
		for (const secondOffset of range(secondMax - secondMin + 1)) {
			const cell: Vec3T = [...anchor]
			cell[firstAxis] = firstMin + firstOffset
			cell[secondAxis] = secondMin + secondOffset
			cells.push(cell)
		}
	}

	return cells
}

export type PrefabIdT = 'lCorner' | 'square' | 'hollowSquare' | 'plus'

export type PrefabT = {
	id: PrefabIdT
	name: string
	// [u, v] offsets on the face plane, anchor at [0, 0]
	cells: [number, number][]
}

const buildSquare = (size: number, isHollow: boolean): [number, number][] => {
	const cells: [number, number][] = []
	const half = Math.floor(size / 2)

	for (const uIndex of range(size)) {
		for (const vIndex of range(size)) {
			const isEdge = uIndex === 0 || vIndex === 0 || uIndex === size - 1 || vIndex === size - 1
			const shouldSkip = isHollow && !isEdge
			if (shouldSkip) continue
			cells.push([uIndex - half, vIndex - half])
		}
	}

	return cells
}

export const PREFABS: PrefabT[] = [
	{ id: 'lCorner', name: 'L-corner', cells: [[0, 0], [1, 0], [0, 1]] },
	{ id: 'square', name: 'Square', cells: buildSquare(3, false) },
	{ id: 'hollowSquare', name: 'Hollow square', cells: buildSquare(5, true) },
	{ id: 'plus', name: 'Plus', cells: [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]] }
]

export const findPrefab = (prefabId: string): PrefabT => {
	const foundPrefab = PREFABS.find((prefab) => prefab.id === prefabId)
	return foundPrefab ?? PREFABS[0]
}

const rotateQuarter = (offset: [number, number], quarterTurns: number): [number, number] => {
	const turns = ((quarterTurns % 4) + 4) % 4
	if (turns === 1) return [-offset[1], offset[0]]
	if (turns === 2) return [-offset[0], -offset[1]]
	if (turns === 3) return [offset[1], -offset[0]]
	return offset
}

// Prefab cells laid on a face, stacked `depth` layers along
// `direction` (the face normal to grow, its inverse to carve).
export const buildPrefabCells = (prefab: PrefabT, anchor: Vec3T, normal: Vec3T, quarterTurns: number, depth: number, direction: Vec3T): Vec3T[] => {
	const tangentAxes = getTangentAxes(normal)
	const cells: Vec3T[] = []

	for (const layerIndex of range(Math.max(depth, 1))) {
		for (const offset of prefab.cells) {
			const rotatedOffset = rotateQuarter(offset, quarterTurns)
			const cell: Vec3T = [
				anchor[0] + direction[0] * layerIndex,
				anchor[1] + direction[1] * layerIndex,
				anchor[2] + direction[2] * layerIndex
			]
			cell[tangentAxes[0]] += rotatedOffset[0]
			cell[tangentAxes[1]] += rotatedOffset[1]
			cells.push(cell)
		}
	}

	return cells
}

const MAX_SURFACE_CELLS = 40000

export type SurfaceInputT = {
	start: Vec3T
	normal: Vec3T
	roomSize: Vec3T
	// cells allowed in the surface (solid and editable)
	checkIsSurfaceCell: (cell: Vec3T) => boolean
	checkIsSolid: (cell: Vec3T) => boolean
}

const checkIsExposed = (input: SurfaceInputT, cell: Vec3T): boolean => {
	const outsideCell = addVec(cell, input.normal)
	const isOutsideRoom = !checkIsInsideRoom(outsideCell, input.roomSize)
	if (isOutsideRoom) return false
	return !input.checkIsSolid(outsideCell)
}

// Every solid cell whose face points the same way as the
// clicked face, reachable across shared edges on that plane.
export const findConnectedSurface = (input: SurfaceInputT): Vec3T[] => {
	const tangentAxes = getTangentAxes(input.normal)
	const planeSteps: Vec3T[] = FACE_NORMALS.filter((normal) => {
		return normal[tangentAxes[0]] !== 0 || normal[tangentAxes[1]] !== 0
	})

	const isStartValid = input.checkIsSurfaceCell(input.start) && checkIsExposed(input, input.start)
	if (!isStartValid) return []

	const visitedKeys = new Set<number>([toCellKeyFromVec(input.start)])
	const surfaceCells: Vec3T[] = [input.start]

	for (const surfaceCell of surfaceCells) {
		const isFull = surfaceCells.length >= MAX_SURFACE_CELLS
		if (isFull) break

		for (const planeStep of planeSteps) {
			const neighbor = addVec(surfaceCell, planeStep)
			const isInside = checkIsInsideRoom(neighbor, input.roomSize)
			if (!isInside) continue
			const neighborKey = toCellKeyFromVec(neighbor)
			const wasVisited = visitedKeys.has(neighborKey)
			if (wasVisited) continue
			visitedKeys.add(neighborKey)
			const isSurfaceCell = input.checkIsSurfaceCell(neighbor) && checkIsExposed(input, neighbor)
			if (isSurfaceCell) surfaceCells.push(neighbor)
		}
	}

	return surfaceCells
}

const MAX_CONNECTED_CELLS = 200000

// Flood fill across face-sharing neighbors.
export const findConnectedCells = (start: Vec3T, roomSize: Vec3T, checkIsMember: (cell: Vec3T) => boolean): Vec3T[] => {
	const isStartMember = checkIsMember(start)
	if (!isStartMember) return []
	const visitedKeys = new Set<number>([toCellKeyFromVec(start)])
	const connectedCells: Vec3T[] = [start]

	for (const connectedCell of connectedCells) {
		const isFull = connectedCells.length >= MAX_CONNECTED_CELLS
		if (isFull) break

		for (const normal of FACE_NORMALS) {
			const neighbor = addVec(connectedCell, normal)
			const isInside = checkIsInsideRoom(neighbor, roomSize)
			if (!isInside) continue
			const neighborKey = toCellKeyFromVec(neighbor)
			const wasVisited = visitedKeys.has(neighborKey)
			if (wasVisited) continue
			visitedKeys.add(neighborKey)
			const isMember = checkIsMember(neighbor)
			if (isMember) connectedCells.push(neighbor)
		}
	}

	return connectedCells
}
