import { BufferGeometry } from 'three'
import { toCellKey, toCellKeyFromVec } from '../../model/cellKey'
import { buildColorTable, buildVoxelGeometry } from '../../model/mesher'
import { checkIsGroupHidden } from '../../model/groups'
import type { CellT, ProjectT, Vec3T } from '../../model/types'

export type ProjectModelT = {
	geometry: BufferGeometry
	scale: number
	isEmpty: boolean
}

const MODEL_MAX_WIDTH = 1.5
const MODEL_MAX_HEIGHT = 2.2

type BoundsT = {
	min: Vec3T
	max: Vec3T
}

const createEmptyBounds = (): BoundsT => {
	return { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }
}

const growBounds = (bounds: BoundsT, position: Vec3T): void => {
	bounds.min[0] = Math.min(bounds.min[0], position[0])
	bounds.min[1] = Math.min(bounds.min[1], position[1])
	bounds.min[2] = Math.min(bounds.min[2], position[2])
	bounds.max[0] = Math.max(bounds.max[0], position[0] + 1)
	bounds.max[1] = Math.max(bounds.max[1], position[1] + 1)
	bounds.max[2] = Math.max(bounds.max[2], position[2] + 1)
}

// The whole project as one merged, lightweight mesh, scaled
// to sit on a pedestal.
export const buildProjectModel = (project: ProjectT): ProjectModelT => {
	const cells = new Map<number, CellT>()
	const bounds = createEmptyBounds()
	const groupMetas = project.groups.map((group) => ({ ...group, voxels: undefined }))

	for (const group of project.groups) {
		const isHidden = checkIsGroupHidden(groupMetas, group.id)
		if (isHidden) continue

		for (const voxel of group.voxels) {
			cells.set(toCellKeyFromVec(voxel.position), { groupId: group.id, colorIndex: voxel.colorIndex, shape: voxel.shape, rotation: voxel.rotation })
			growBounds(bounds, voxel.position)
		}
	}

	const isEmpty = cells.size === 0
	if (isEmpty) return { geometry: new BufferGeometry(), scale: 1, isEmpty }

	const width = Math.max(bounds.max[0] - bounds.min[0], bounds.max[2] - bounds.min[2])
	const height = bounds.max[1] - bounds.min[1]
	const scale = Math.min(MODEL_MAX_WIDTH / width, MODEL_MAX_HEIGHT / height)
	const centerX = (bounds.min[0] + bounds.max[0]) / 2
	const centerZ = (bounds.min[2] + bounds.max[2]) / 2

	const geometry = buildVoxelGeometry({
		keys: cells.keys(),
		getCell: (key) => cells.get(key) ?? null,
		checkIsBlocking: (x, y, z) => cells.has(toCellKey(x, y, z)),
		colorTable: buildColorTable(project.colors),
		isFlatShaded: false,
		hasAmbientOcclusion: true,
		origin: [centerX, bounds.min[1], centerZ],
		scale
	})

	return { geometry, scale, isEmpty }
}

export type AabbT = {
	center: Vec3T
	half: Vec3T
}

// Ray vs axis-aligned box (slab method). Returns the hit
// distance, or Infinity on a miss.
export const intersectRayBox = (origin: Vec3T, direction: Vec3T, box: AabbT): number => {
	let nearTime = -Infinity
	let farTime = Infinity

	for (const axis of [0, 1, 2] as const) {
		const minimum = box.center[axis] - box.half[axis]
		const maximum = box.center[axis] + box.half[axis]
		const isParallel = Math.abs(direction[axis]) < 1e-8

		if (isParallel) {
			const isOutside = origin[axis] < minimum || origin[axis] > maximum
			if (isOutside) return Infinity
			continue
		}

		const firstTime = (minimum - origin[axis]) / direction[axis]
		const secondTime = (maximum - origin[axis]) / direction[axis]
		nearTime = Math.max(nearTime, Math.min(firstTime, secondTime))
		farTime = Math.min(farTime, Math.max(firstTime, secondTime))
	}

	const isMiss = nearTime > farTime || farTime < 0
	if (isMiss) return Infinity
	return Math.max(nearTime, 0)
}
