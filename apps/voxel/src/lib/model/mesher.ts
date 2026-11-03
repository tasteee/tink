import { BufferGeometry, Color, Float32BufferAttribute, Uint32BufferAttribute } from 'three'
import { FACE_NORMALS, fromCellKey, getTangentAxes } from './cellKey'
import type { CellT, Vec3T } from './types'

// Corners of each face, counter-clockwise seen from outside,
// in the same order as FACE_NORMALS.
const FACE_CORNERS: Vec3T[][] = [
	[[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]],
	[[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]],
	[[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]],
	[[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
	[[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
	[[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]]
]

// Flat view shades sides a touch so shapes stay readable
// while the top face shows the exact picked color.
const FLAT_FACE_SHADES = [0.86, 0.86, 1, 0.7, 0.93, 0.93]
const LIT_FACE_SHADES = [1, 1, 1, 1, 1, 1]

// Ambient occlusion levels by how many neighbors touch a corner.
const AO_LEVELS = [0.42, 0.62, 0.82, 1]

export type MeshOptionsT = {
	keys: Iterable<number>
	getCell: (key: number) => CellT | null
	// true when a neighbor cell hides the face touching it
	checkIsBlocking: (x: number, y: number, z: number) => boolean
	colorTable: Color[]
	isFlatShaded: boolean
	hasAmbientOcclusion: boolean
	// subtracted from every vertex, e.g. a pivot for export
	origin: Vec3T
	// multiplied into every vertex after the origin shift
	scale: number
}

type MeshBuffersT = {
	positions: number[]
	normals: number[]
	colors: number[]
	indexes: number[]
}

const createBuffers = (): MeshBuffersT => {
	return { positions: [], normals: [], colors: [], indexes: [] }
}

const toBlockFlag = (isBlocking: boolean): number => {
	return isBlocking ? 1 : 0
}

const getCornerOcclusion = (options: MeshOptionsT, cellPosition: Vec3T, normal: Vec3T, corner: Vec3T): number => {
	const tangentAxes = getTangentAxes(normal)
	const firstAxis = tangentAxes[0]
	const secondAxis = tangentAxes[1]
	const firstSign = corner[firstAxis] === 1 ? 1 : -1
	const secondSign = corner[secondAxis] === 1 ? 1 : -1

	const outside: Vec3T = [cellPosition[0] + normal[0], cellPosition[1] + normal[1], cellPosition[2] + normal[2]]
	const firstSide: Vec3T = [...outside]
	firstSide[firstAxis] += firstSign
	const secondSide: Vec3T = [...outside]
	secondSide[secondAxis] += secondSign
	const diagonal: Vec3T = [...firstSide]
	diagonal[secondAxis] += secondSign

	const isFirstBlocked = options.checkIsBlocking(firstSide[0], firstSide[1], firstSide[2])
	const isSecondBlocked = options.checkIsBlocking(secondSide[0], secondSide[1], secondSide[2])
	const isDiagonalBlocked = options.checkIsBlocking(diagonal[0], diagonal[1], diagonal[2])
	const isFullyOccluded = isFirstBlocked && isSecondBlocked
	if (isFullyOccluded) return AO_LEVELS[0]

	const blockedCount = toBlockFlag(isFirstBlocked) + toBlockFlag(isSecondBlocked) + toBlockFlag(isDiagonalBlocked)
	return AO_LEVELS[3 - blockedCount]
}

const getCornerOcclusions = (options: MeshOptionsT, cellPosition: Vec3T, faceIndex: number): number[] => {
	const corners = FACE_CORNERS[faceIndex]
	if (!options.hasAmbientOcclusion) return [1, 1, 1, 1]
	const normal = FACE_NORMALS[faceIndex]
	return corners.map((corner) => getCornerOcclusion(options, cellPosition, normal, corner))
}

const pushFace = (buffers: MeshBuffersT, options: MeshOptionsT, cellPosition: Vec3T, faceIndex: number, baseColor: Color): void => {
	const corners = FACE_CORNERS[faceIndex]
	const normal = FACE_NORMALS[faceIndex]
	const occlusions = getCornerOcclusions(options, cellPosition, faceIndex)
	const shadeTable = options.isFlatShaded ? FLAT_FACE_SHADES : LIT_FACE_SHADES
	const faceShade = shadeTable[faceIndex]
	const firstVertex = buffers.positions.length / 3

	for (const [cornerIndex, corner] of corners.entries()) {
		const vertexX = (cellPosition[0] + corner[0] - options.origin[0]) * options.scale
		const vertexY = (cellPosition[1] + corner[1] - options.origin[1]) * options.scale
		const vertexZ = (cellPosition[2] + corner[2] - options.origin[2]) * options.scale
		const brightness = faceShade * occlusions[cornerIndex]
		buffers.positions.push(vertexX, vertexY, vertexZ)
		buffers.normals.push(normal[0], normal[1], normal[2])
		buffers.colors.push(baseColor.r * brightness, baseColor.g * brightness, baseColor.b * brightness)
	}

	// Flip the quad's diagonal so AO gradients stay symmetric.
	const firstDiagonal = occlusions[0] + occlusions[2]
	const secondDiagonal = occlusions[1] + occlusions[3]
	const shouldFlip = firstDiagonal < secondDiagonal

	if (shouldFlip) {
		buffers.indexes.push(firstVertex + 1, firstVertex + 2, firstVertex + 3, firstVertex + 1, firstVertex + 3, firstVertex)
		return
	}

	buffers.indexes.push(firstVertex, firstVertex + 1, firstVertex + 2, firstVertex, firstVertex + 2, firstVertex + 3)
}

const FALLBACK_COLOR = new Color('#ff00ff')

// Builds one merged, face-culled mesh for a set of cells.
// Faces touching a blocking neighbor are skipped, so a solid
// block of voxels costs only its outer shell.
export const buildVoxelGeometry = (options: MeshOptionsT): BufferGeometry => {
	const buffers = createBuffers()

	for (const key of options.keys) {
		const cell = options.getCell(key)
		if (cell === null) continue
		const cellPosition = fromCellKey(key)
		const baseColor = options.colorTable[cell.colorIndex] ?? FALLBACK_COLOR

		for (const [faceIndex, normal] of FACE_NORMALS.entries()) {
			const neighborX = cellPosition[0] + normal[0]
			const neighborY = cellPosition[1] + normal[1]
			const neighborZ = cellPosition[2] + normal[2]
			const isHidden = options.checkIsBlocking(neighborX, neighborY, neighborZ)
			if (isHidden) continue
			pushFace(buffers, options, cellPosition, faceIndex, baseColor)
		}
	}

	const geometry = new BufferGeometry()
	geometry.setAttribute('position', new Float32BufferAttribute(buffers.positions, 3))
	geometry.setAttribute('normal', new Float32BufferAttribute(buffers.normals, 3))
	geometry.setAttribute('color', new Float32BufferAttribute(buffers.colors, 3))
	geometry.setIndex(new Uint32BufferAttribute(buffers.indexes, 1))
	geometry.computeBoundingSphere()
	geometry.computeBoundingBox()
	return geometry
}

// Hex strings to linear colors, ready for vertex colors.
export const buildColorTable = (hexColors: string[]): Color[] => {
	return hexColors.map((hexColor) => new Color(hexColor))
}
