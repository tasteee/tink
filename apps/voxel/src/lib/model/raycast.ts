import { range } from './cellKey'
import type { Vec3T } from './types'

export type AimKindT = 'voxel' | 'wall'

// What the pointer is resting on.
// - cell: the voxel hit, or for walls the room cell touching it
// - placeCell: where a new block would land
// - normal: unit normal of the face that was hit
export type AimT = {
	kind: AimKindT
	cell: Vec3T
	placeCell: Vec3T
	normal: Vec3T
	point: Vec3T
	distance: number
}

export type VoxelRayInputT = {
	origin: Vec3T
	direction: Vec3T
	roomSize: Vec3T
	checkIsSolid: (x: number, y: number, z: number) => boolean
}

const getStepSign = (directionPart: number): number => {
	const isPositive = directionPart > 0
	if (isPositive) return 1
	const isNegative = directionPart < 0
	if (isNegative) return -1
	return 0
}

const getFirstBoundaryTime = (originPart: number, directionPart: number, cellPart: number): number => {
	const isStill = directionPart === 0
	if (isStill) return Infinity
	const isPositive = directionPart > 0
	const boundary = isPositive ? cellPart + 1 : cellPart
	return (boundary - originPart) / directionPart
}

const getBoundaryStepTime = (directionPart: number): number => {
	const isStill = directionPart === 0
	if (isStill) return Infinity
	return Math.abs(1 / directionPart)
}

const getSmallestAxis = (times: Vec3T): 0 | 1 | 2 => {
	const isXSmallest = times[0] <= times[1] && times[0] <= times[2]
	if (isXSmallest) return 0
	const isYSmallest = times[1] <= times[2]
	if (isYSmallest) return 1
	return 2
}

const clampInside = (value: number, size: number): number => {
	return Math.min(Math.max(value, 0.001), size - 0.001)
}

// Walks the voxel grid cell by cell along the ray
// (Amanatides & Woo). The room walls always catch the ray,
// so there is always a target.
export const castVoxelRay = (input: VoxelRayInputT): AimT => {
	const origin: Vec3T = [
		clampInside(input.origin[0], input.roomSize[0]),
		clampInside(input.origin[1], input.roomSize[1]),
		clampInside(input.origin[2], input.roomSize[2])
	]

	const direction = input.direction
	const cell: Vec3T = [Math.floor(origin[0]), Math.floor(origin[1]), Math.floor(origin[2])]
	const steps: Vec3T = [getStepSign(direction[0]), getStepSign(direction[1]), getStepSign(direction[2])]

	const nextTimes: Vec3T = [
		getFirstBoundaryTime(origin[0], direction[0], cell[0]),
		getFirstBoundaryTime(origin[1], direction[1], cell[1]),
		getFirstBoundaryTime(origin[2], direction[2], cell[2])
	]

	const stepTimes: Vec3T = [getBoundaryStepTime(direction[0]), getBoundaryStepTime(direction[1]), getBoundaryStepTime(direction[2])]
	const maxSteps = input.roomSize[0] + input.roomSize[1] + input.roomSize[2] + 3

	for (const _stepIndex of range(maxSteps)) {
		const axis = getSmallestAxis(nextTimes)
		const hitTime = nextTimes[axis]
		const previousCell: Vec3T = [...cell]
		cell[axis] += steps[axis]
		nextTimes[axis] += stepTimes[axis]

		const normal: Vec3T = [0, 0, 0]
		normal[axis] = -steps[axis]

		const point: Vec3T = [origin[0] + direction[0] * hitTime, origin[1] + direction[1] * hitTime, origin[2] + direction[2] * hitTime]

		const isOutside = cell[axis] < 0 || cell[axis] >= input.roomSize[axis]

		if (isOutside) {
			return { kind: 'wall', cell: previousCell, placeCell: previousCell, normal, point, distance: hitTime }
		}

		const isSolid = input.checkIsSolid(cell[0], cell[1], cell[2])
		if (!isSolid) continue

		return { kind: 'voxel', cell: [...cell], placeCell: previousCell, normal, point, distance: hitTime }
	}

	return { kind: 'wall', cell, placeCell: cell, normal: [0, 1, 0], point: origin, distance: 0 }
}
