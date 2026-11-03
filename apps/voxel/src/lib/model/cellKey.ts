import type { Vec3T } from './types'

// A cell position packs into one integer key, so the voxel
// map stays a fast Map<number, CellT>. Each axis gets 10 bits.
export const AXIS_SPAN = 1024
const PLANE_SPAN = AXIS_SPAN * AXIS_SPAN

export const MAX_ROOM_SIZE = 512
export const MIN_ROOM_SIZE = 8

export const toCellKey = (x: number, y: number, z: number): number => {
	return x + y * AXIS_SPAN + z * PLANE_SPAN
}

export const toCellKeyFromVec = (position: Vec3T): number => {
	return toCellKey(position[0], position[1], position[2])
}

export const fromCellKey = (key: number): Vec3T => {
	const x = key % AXIS_SPAN
	const y = Math.floor(key / AXIS_SPAN) % AXIS_SPAN
	const z = Math.floor(key / PLANE_SPAN)
	return [x, y, z]
}

export const checkIsInsideRoom = (position: Vec3T, roomSize: Vec3T): boolean => {
	const isXInside = position[0] >= 0 && position[0] < roomSize[0]
	const isYInside = position[1] >= 0 && position[1] < roomSize[1]
	const isZInside = position[2] >= 0 && position[2] < roomSize[2]
	return isXInside && isYInside && isZInside
}

export const addVec = (left: Vec3T, right: Vec3T): Vec3T => {
	return [left[0] + right[0], left[1] + right[1], left[2] + right[2]]
}

export const subtractVec = (left: Vec3T, right: Vec3T): Vec3T => {
	return [left[0] - right[0], left[1] - right[1], left[2] - right[2]]
}

export const scaleVec = (vector: Vec3T, factor: number): Vec3T => {
	return [vector[0] * factor, vector[1] * factor, vector[2] * factor]
}

export const checkIsSameVec = (left: Vec3T, right: Vec3T): boolean => {
	return left[0] === right[0] && left[1] === right[1] && left[2] === right[2]
}

export const FACE_NORMALS: Vec3T[] = [
	[1, 0, 0],
	[-1, 0, 0],
	[0, 1, 0],
	[0, -1, 0],
	[0, 0, 1],
	[0, 0, -1]
]

// Cached [0..count) arrays, so hot loops can use for...of
// without allocating every frame.
const rangeCache = new Map<number, number[]>()

export const range = (count: number): number[] => {
	const cachedRange = rangeCache.get(count)
	if (cachedRange) return cachedRange
	const createdRange = Array.from({ length: count }, (_unused, position) => position)
	rangeCache.set(count, createdRange)
	return createdRange
}

// The axis a unit normal points along.
export const getNormalAxis = (normal: Vec3T): 0 | 1 | 2 => {
	const isXAxis = normal[0] !== 0
	if (isXAxis) return 0
	const isYAxis = normal[1] !== 0
	if (isYAxis) return 1
	return 2
}

// The two axes that span the plane a normal is facing out of.
export const getTangentAxes = (normal: Vec3T): [0 | 1 | 2, 0 | 1 | 2] => {
	const normalAxis = getNormalAxis(normal)
	if (normalAxis === 0) return [1, 2]
	if (normalAxis === 1) return [0, 2]
	return [0, 1]
}
