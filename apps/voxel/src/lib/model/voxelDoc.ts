import { FACE_NORMALS, addVec, checkIsInsideRoom, fromCellKey, toCellKey, toCellKeyFromVec } from './cellKey'
import type { CellT, GroupMetaT, ProjectMetaT, ProjectT, Vec3T, VoxelT } from './types'

// The open project's voxels. Kept outside Svelte reactivity on
// purpose: a model can hold hundreds of thousands of cells.
// Mesh rebuilds are driven by dirty group ids instead.
export type VoxelDocT = {
	cells: Map<number, CellT>
	groupCells: Map<string, Set<number>>
	dirtyGroupIds: Set<string>
	roomSize: Vec3T
}

export const voxelDoc: VoxelDocT = {
	cells: new Map(),
	groupCells: new Map(),
	dirtyGroupIds: new Set(),
	roomSize: [128, 128, 128]
}

export type CellChangeT = {
	before: CellT | null
	after: CellT | null
}

// Collects the first "before" and last "after" of every cell
// touched during one edit, so the edit can be undone.
let activeChanges: Map<number, CellChangeT> | null = null

export const startRecordingChanges = (): void => {
	activeChanges = new Map()
}

export const stopRecordingChanges = (): Map<number, CellChangeT> => {
	const recordedChanges = activeChanges ?? new Map<number, CellChangeT>()
	activeChanges = null
	return recordedChanges
}

const getGroupCellSet = (groupId: string): Set<number> => {
	const existingSet = voxelDoc.groupCells.get(groupId)
	if (existingSet) return existingSet
	const createdSet = new Set<number>()
	voxelDoc.groupCells.set(groupId, createdSet)
	return createdSet
}

// A cell change can expose or hide faces of the neighbors,
// so their groups need a fresh mesh too.
const markNeighborsDirty = (key: number): void => {
	const position = fromCellKey(key)

	for (const normal of FACE_NORMALS) {
		const neighborPosition = addVec(position, normal)
		const isInside = checkIsInsideRoom(neighborPosition, voxelDoc.roomSize)
		if (!isInside) continue
		const neighborCell = voxelDoc.cells.get(toCellKeyFromVec(neighborPosition))
		if (neighborCell) voxelDoc.dirtyGroupIds.add(neighborCell.groupId)
	}
}

const recordChange = (key: number, before: CellT | null, after: CellT | null): void => {
	if (activeChanges === null) return
	const existingChange = activeChanges.get(key)

	if (existingChange) {
		existingChange.after = after
		return
	}

	activeChanges.set(key, { before, after })
}

export const getCell = (key: number): CellT | null => {
	return voxelDoc.cells.get(key) ?? null
}

// The one write path for voxels. Pass null to clear a cell.
export const setCell = (key: number, nextCell: CellT | null): void => {
	const previousCell = voxelDoc.cells.get(key) ?? null
	const isNoChange = previousCell === null && nextCell === null
	if (isNoChange) return

	recordChange(key, previousCell, nextCell)

	if (previousCell) {
		voxelDoc.groupCells.get(previousCell.groupId)?.delete(key)
		voxelDoc.dirtyGroupIds.add(previousCell.groupId)
	}

	if (nextCell === null) {
		voxelDoc.cells.delete(key)
		markNeighborsDirty(key)
		return
	}

	voxelDoc.cells.set(key, nextCell)
	getGroupCellSet(nextCell.groupId).add(key)
	voxelDoc.dirtyGroupIds.add(nextCell.groupId)
	markNeighborsDirty(key)
}

export const takeDirtyGroupIds = (): string[] => {
	const dirtyIds = [...voxelDoc.dirtyGroupIds]
	voxelDoc.dirtyGroupIds.clear()
	return dirtyIds
}

export const loadVoxelDoc = (project: ProjectT): void => {
	voxelDoc.cells = new Map()
	voxelDoc.groupCells = new Map()
	voxelDoc.dirtyGroupIds = new Set()
	voxelDoc.roomSize = [...project.roomSize]

	for (const group of project.groups) {
		const groupSet = getGroupCellSet(group.id)

		for (const voxel of group.voxels) {
			const isInside = checkIsInsideRoom(voxel.position, project.roomSize)
			if (!isInside) continue
			const key = toCellKeyFromVec(voxel.position)

			const cell: CellT = {
				groupId: group.id,
				colorIndex: voxel.colorIndex,
				shape: voxel.shape,
				rotation: voxel.rotation
			}

			voxelDoc.cells.set(key, cell)
			groupSet.add(key)
		}
	}
}

const buildGroupVoxels = (groupId: string): VoxelT[] => {
	const groupSet = voxelDoc.groupCells.get(groupId)
	if (!groupSet) return []
	const voxels: VoxelT[] = []

	for (const key of groupSet) {
		const cell = voxelDoc.cells.get(key)
		if (!cell) continue

		voxels.push({
			position: fromCellKey(key),
			colorIndex: cell.colorIndex,
			shape: cell.shape,
			rotation: cell.rotation
		})
	}

	return voxels
}

export const buildProjectFromDoc = (meta: ProjectMetaT): ProjectT => {
	const groups = meta.groups.map((groupMeta: GroupMetaT) => {
		const voxels = buildGroupVoxels(groupMeta.id)
		return { ...groupMeta, voxels }
	})

	return { ...meta, groups }
}

export const getGroupKeys = (groupId: string): number[] => {
	const groupSet = voxelDoc.groupCells.get(groupId)
	if (!groupSet) return []
	return [...groupSet]
}

export const countGroupVoxels = (groupId: string): number => {
	return voxelDoc.groupCells.get(groupId)?.size ?? 0
}

export const checkIsCellOccupied = (x: number, y: number, z: number): boolean => {
	return voxelDoc.cells.has(toCellKey(x, y, z))
}
