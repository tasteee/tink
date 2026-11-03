import { fromCellKey } from './cellKey'
import { voxelDoc } from './voxelDoc'
import type { GroupMetaT, Vec3T } from './types'

export const findGroup = (groups: GroupMetaT[], groupId: string | null): GroupMetaT | null => {
	if (groupId === null) return null
	const foundGroup = groups.find((group) => group.id === groupId)
	return foundGroup ?? null
}

export const getChildGroups = (groups: GroupMetaT[], parentId: string | null): GroupMetaT[] => {
	return groups.filter((group) => group.parentId === parentId)
}

// The group itself plus every group nested under it.
export const getGroupFamilyIds = (groups: GroupMetaT[], rootId: string): string[] => {
	const familyIds = [rootId]

	for (const familyId of familyIds) {
		const childGroups = getChildGroups(groups, familyId)
		for (const childGroup of childGroups) familyIds.push(childGroup.id)
	}

	return familyIds
}

const getAncestorChain = (groups: GroupMetaT[], groupId: string): GroupMetaT[] => {
	const chain: GroupMetaT[] = []
	const visitedIds = new Set<string>()
	let currentGroup = findGroup(groups, groupId)

	for (const _step of groups) {
		const isChainDone = currentGroup === null || visitedIds.has(currentGroup.id)
		if (isChainDone) break
		if (currentGroup === null) break
		chain.push(currentGroup)
		visitedIds.add(currentGroup.id)
		currentGroup = findGroup(groups, currentGroup.parentId)
	}

	return chain
}

// A group is hidden or locked when it or any ancestor is.
export const checkIsGroupHidden = (groups: GroupMetaT[], groupId: string): boolean => {
	const chain = getAncestorChain(groups, groupId)
	return chain.some((group) => group.isHidden)
}

export const checkIsGroupLocked = (groups: GroupMetaT[], groupId: string): boolean => {
	const chain = getAncestorChain(groups, groupId)
	return chain.some((group) => group.isLocked)
}

export const getGroupDepth = (groups: GroupMetaT[], groupId: string): number => {
	const chain = getAncestorChain(groups, groupId)
	return chain.length - 1
}

// Groups in tree order: each parent followed by its children.
export const getGroupsInTreeOrder = (groups: GroupMetaT[]): GroupMetaT[] => {
	const orderedGroups: GroupMetaT[] = []

	const visitChildren = (parentId: string | null): void => {
		const childGroups = getChildGroups(groups, parentId)

		for (const childGroup of childGroups) {
			orderedGroups.push(childGroup)
			visitChildren(childGroup.id)
		}
	}

	visitChildren(null)
	return orderedGroups
}

// Center of the group's bounding box, in voxel-center units
// (a lone voxel at 0,0,0 has its center at 0.5,0.5,0.5).
export const computeGroupCenter = (groupIds: string[]): Vec3T | null => {
	const minimum: Vec3T = [Infinity, Infinity, Infinity]
	const maximum: Vec3T = [-Infinity, -Infinity, -Infinity]
	let hasAnyCell = false

	for (const groupId of groupIds) {
		const groupSet = voxelDoc.groupCells.get(groupId)
		if (!groupSet) continue

		for (const key of groupSet) {
			const position = fromCellKey(key)
			hasAnyCell = true
			minimum[0] = Math.min(minimum[0], position[0])
			minimum[1] = Math.min(minimum[1], position[1])
			minimum[2] = Math.min(minimum[2], position[2])
			maximum[0] = Math.max(maximum[0], position[0] + 1)
			maximum[1] = Math.max(maximum[1], position[1] + 1)
			maximum[2] = Math.max(maximum[2], position[2] + 1)
		}
	}

	if (!hasAnyCell) return null
	const centerX = (minimum[0] + maximum[0]) / 2
	const centerY = (minimum[1] + maximum[1]) / 2
	const centerZ = (minimum[2] + maximum[2]) / 2
	return [centerX, centerY, centerZ]
}
