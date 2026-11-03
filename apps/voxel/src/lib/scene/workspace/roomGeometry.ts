import { BufferGeometry, Float32BufferAttribute } from 'three'
import { range } from '../../model/cellKey'
import type { Vec3T } from '../../model/types'

export const MAJOR_LINE_STEP = 8
const SURFACE_INSET = 0.004

type LinePointsT = {
	minor: number[]
	major: number[]
}

const pushLine = (points: LinePointsT, isMajor: boolean, start: Vec3T, end: Vec3T): void => {
	const target = isMajor ? points.major : points.minor
	target.push(start[0], start[1], start[2], end[0], end[1], end[2])
}

// Grid lines on one wall: `fixedAxis` is the axis the wall is
// flat on, at `fixedValue`. Lines run along the other two.
const addWallGrid = (points: LinePointsT, roomSize: Vec3T, fixedAxis: 0 | 1 | 2, fixedValue: number): void => {
	const otherAxes = ([0, 1, 2] as const).filter((axis) => axis !== fixedAxis)
	const firstAxis = otherAxes[0]
	const secondAxis = otherAxes[1]

	for (const firstValue of range(roomSize[firstAxis] + 1)) {
		const start: Vec3T = [0, 0, 0]
		start[fixedAxis] = fixedValue
		start[firstAxis] = firstValue
		const end: Vec3T = [...start]
		end[secondAxis] = roomSize[secondAxis]
		const isMajor = firstValue % MAJOR_LINE_STEP === 0
		pushLine(points, isMajor, start, end)
	}

	for (const secondValue of range(roomSize[secondAxis] + 1)) {
		const start: Vec3T = [0, 0, 0]
		start[fixedAxis] = fixedValue
		start[secondAxis] = secondValue
		const end: Vec3T = [...start]
		end[firstAxis] = roomSize[firstAxis]
		const isMajor = secondValue % MAJOR_LINE_STEP === 0
		pushLine(points, isMajor, start, end)
	}
}

const toGeometry = (points: number[]): BufferGeometry => {
	const geometry = new BufferGeometry()
	geometry.setAttribute('position', new Float32BufferAttribute(points, 3))
	return geometry
}

// One line per voxel on the floor, ceiling and all four walls.
export const buildRoomGridGeometry = (roomSize: Vec3T): { minor: BufferGeometry; major: BufferGeometry } => {
	const points: LinePointsT = { minor: [], major: [] }

	for (const axis of [0, 1, 2] as const) {
		addWallGrid(points, roomSize, axis, SURFACE_INSET)
		addWallGrid(points, roomSize, axis, roomSize[axis] - SURFACE_INSET)
	}

	return { minor: toGeometry(points.minor), major: toGeometry(points.major) }
}
