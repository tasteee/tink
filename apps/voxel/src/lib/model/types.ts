export type Vec3T = [number, number, number]

// Axis index into a Vec3T: 0 = x, 1 = y, 2 = z.
export type AxisT = 0 | 1 | 2

export type VoxelShapeT = 'cube'

export type VoxelT = {
	position: Vec3T
	colorIndex: number
	// 'cube' only in V1
	shape: VoxelShapeT
	// 0-23, one of the 24 cube orientations
	rotation: number
}

export type GroupT = {
	id: string
	name: string
	parentId: string | null
	pivot: Vec3T
	// false while the pivot follows the computed center
	hasCustomPivot: boolean
	isHidden: boolean
	isLocked: boolean
	voxels: VoxelT[]
}

export type ProjectT = {
	version: 1
	id: string
	name: string
	roomSize: Vec3T
	colors: string[]
	palette: number[]
	recentColors: number[]
	groups: GroupT[]
	activeGroupId: string
}

export type GalleryEntryT = {
	projectId: string
	position: Vec3T
}

export type GalleryT = {
	projects: GalleryEntryT[]
}

// In-memory form of a voxel. The position lives in the key.
export type CellT = {
	groupId: string
	colorIndex: number
	shape: VoxelShapeT
	rotation: number
}

// A group without its voxels. Voxels live in the cell map.
export type GroupMetaT = Omit<GroupT, 'voxels'>

// Everything about a project except its voxels. Small enough
// to snapshot whole for undo.
export type ProjectMetaT = Omit<ProjectT, 'groups'> & {
	groups: GroupMetaT[]
}
