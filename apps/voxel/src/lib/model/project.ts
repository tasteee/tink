import { MAX_ROOM_SIZE, MIN_ROOM_SIZE } from './cellKey'
import type { GroupMetaT, GroupT, ProjectT, Vec3T, VoxelT } from './types'

export const DEFAULT_ROOM_SIZE: Vec3T = [128, 128, 128]
export const PROJECT_EXTENSION = '.vx'

export const createId = (): string => {
	return crypto.randomUUID()
}

const STARTER_COLORS = ['#f4f1ea', '#2b2b33', '#e85d75', '#f2a541', '#f7d046', '#5cc8a1', '#4aa3df', '#8e6bd8']

export const createGroupMeta = (name: string, parentId: string | null): GroupMetaT => {
	return {
		id: createId(),
		name,
		parentId,
		pivot: [0, 0, 0],
		hasCustomPivot: false,
		isHidden: false,
		isLocked: false
	}
}

export const clampRoomSize = (size: number): number => {
	const roundedSize = Math.round(size)
	const isInvalid = Number.isNaN(roundedSize)
	if (isInvalid) return DEFAULT_ROOM_SIZE[0]
	return Math.min(Math.max(roundedSize, MIN_ROOM_SIZE), MAX_ROOM_SIZE)
}

export const createProject = (name: string, roomSize: Vec3T): ProjectT => {
	const defaultGroup = createGroupMeta('Model', null)
	const clampedSize: Vec3T = [clampRoomSize(roomSize[0]), clampRoomSize(roomSize[1]), clampRoomSize(roomSize[2])]
	const roomCenter: Vec3T = [clampedSize[0] / 2, 0, clampedSize[2] / 2]
	const firstGroup: GroupT = { ...defaultGroup, pivot: roomCenter, voxels: [] }

	return {
		version: 1,
		id: createId(),
		name,
		roomSize: clampedSize,
		colors: [...STARTER_COLORS],
		palette: STARTER_COLORS.map((_color, colorIndex) => colorIndex),
		recentColors: [],
		groups: [firstGroup],
		activeGroupId: firstGroup.id
	}
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null
}

const isVec3 = (value: unknown): value is Vec3T => {
	const isArray = Array.isArray(value) && value.length === 3
	if (!isArray) return false
	return value.every((part) => typeof part === 'number' && Number.isFinite(part))
}

const isNumberList = (value: unknown): value is number[] => {
	const isArray = Array.isArray(value)
	if (!isArray) return false
	return value.every((part) => typeof part === 'number')
}

const isStringList = (value: unknown): value is string[] => {
	const isArray = Array.isArray(value)
	if (!isArray) return false
	return value.every((part) => typeof part === 'string')
}

const parseVoxel = (value: unknown): VoxelT | null => {
	if (!isRecord(value)) return null
	const hasPosition = isVec3(value.position)
	if (!hasPosition) return null
	const colorIndex = typeof value.colorIndex === 'number' ? value.colorIndex : 0
	const rotation = typeof value.rotation === 'number' ? value.rotation : 0
	const position = value.position as Vec3T
	return { position: [...position], colorIndex, shape: 'cube', rotation }
}

const parseGroup = (value: unknown): GroupT | null => {
	if (!isRecord(value)) return null
	const hasId = typeof value.id === 'string'
	if (!hasId) return null
	const rawVoxels = Array.isArray(value.voxels) ? value.voxels : []
	const parsedVoxels = rawVoxels.map(parseVoxel)
	const voxels = parsedVoxels.filter((voxel): voxel is VoxelT => voxel !== null)
	const pivot: Vec3T = isVec3(value.pivot) ? [...value.pivot] : [0, 0, 0]
	const parentId = typeof value.parentId === 'string' ? value.parentId : null

	return {
		id: String(value.id),
		name: typeof value.name === 'string' ? value.name : 'Group',
		parentId,
		pivot,
		hasCustomPivot: value.hasCustomPivot === true,
		isHidden: value.isHidden === true,
		isLocked: value.isLocked === true,
		voxels
	}
}

// Accepts the JSON of a .vx file (or a renamed .json).
// Returns null when the shape is not a project.
export const parseProject = (value: unknown): ProjectT | null => {
	if (!isRecord(value)) return null
	const isVersionOne = value.version === 1
	if (!isVersionOne) return null
	const hasRoomSize = isVec3(value.roomSize)
	if (!hasRoomSize) return null
	const rawGroups = Array.isArray(value.groups) ? value.groups : []
	const parsedGroups = rawGroups.map(parseGroup)
	const groups = parsedGroups.filter((group): group is GroupT => group !== null)
	const hasGroups = groups.length > 0
	if (!hasGroups) return null

	const roomSize = value.roomSize as Vec3T
	const colors = isStringList(value.colors) ? value.colors : [...STARTER_COLORS]
	const activeGroupId = typeof value.activeGroupId === 'string' ? value.activeGroupId : groups[0].id
	const hasActiveGroup = groups.some((group) => group.id === activeGroupId)

	return {
		version: 1,
		id: typeof value.id === 'string' ? value.id : createId(),
		name: typeof value.name === 'string' ? value.name : 'Untitled',
		roomSize: [clampRoomSize(roomSize[0]), clampRoomSize(roomSize[1]), clampRoomSize(roomSize[2])],
		colors,
		palette: isNumberList(value.palette) ? value.palette : [],
		recentColors: isNumberList(value.recentColors) ? value.recentColors : [],
		groups,
		activeGroupId: hasActiveGroup ? activeGroupId : groups[0].id
	}
}

// JSON.parse is the one call that throws on bad input.
export const parseJsonText = (text: string): unknown => {
	try {
		return JSON.parse(text)
	} catch {
		return null
	}
}

export const serializeProject = (project: ProjectT): string => {
	return JSON.stringify(project)
}

export const cloneProjectWithNewIds = (project: ProjectT, name: string): ProjectT => {
	const groupIdMap = new Map<string, string>()
	for (const group of project.groups) groupIdMap.set(group.id, createId())

	const groups = project.groups.map((group) => {
		const parentId = group.parentId === null ? null : (groupIdMap.get(group.parentId) ?? null)
		const id = groupIdMap.get(group.id) ?? createId()
		return { ...group, id, parentId, voxels: group.voxels.map((voxel) => ({ ...voxel })) }
	})

	const activeGroupId = groupIdMap.get(project.activeGroupId) ?? groups[0].id
	return { ...project, id: createId(), name, groups, activeGroupId }
}

export const countProjectVoxels = (project: ProjectT): number => {
	let voxelCount = 0
	for (const group of project.groups) voxelCount += group.voxels.length
	return voxelCount
}
