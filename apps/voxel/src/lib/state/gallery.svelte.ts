import { deleteProjectRecord, loadAllProjects, loadGallery, saveGallery, saveProjectRecord } from '../storage/db'
import type { GalleryEntryT, GalleryT, ProjectT, Vec3T } from '../model/types'

// The gallery room, in meters. Centered on the origin.
export const GALLERY_SIZE: Vec3T = [40, 12, 40]
export const GALLERY_HALF_X = GALLERY_SIZE[0] / 2
export const GALLERY_HALF_Z = GALLERY_SIZE[2] / 2
export const NEW_PEDESTAL_POSITION: Vec3T = [0, 0, 12]
export const GALLERY_SPAWN: Vec3T = [0, 1.7, 17]
export const NEW_PEDESTAL_ID = 'new-project'

// Raw state: project voxel arrays are big and are replaced,
// never mutated in place, so they skip deep proxying.
let projectList = $state.raw<ProjectT[]>([])

const galleryState = $state({
	layout: { projects: [] } as GalleryT,
	aimedId: '',
	movingProjectId: '',
	isLoaded: false
})

export const gallery = {
	get projects(): ProjectT[] {
		return projectList
	},
	set projects(nextProjects: ProjectT[]) {
		projectList = nextProjects
	},
	get layout(): GalleryT {
		return galleryState.layout
	},
	set layout(nextLayout: GalleryT) {
		galleryState.layout = nextLayout
	},
	get aimedId(): string {
		return galleryState.aimedId
	},
	set aimedId(nextId: string) {
		galleryState.aimedId = nextId
	},
	get movingProjectId(): string {
		return galleryState.movingProjectId
	},
	set movingProjectId(nextId: string) {
		galleryState.movingProjectId = nextId
	},
	get isLoaded(): boolean {
		return galleryState.isLoaded
	},
	set isLoaded(nextIsLoaded: boolean) {
		galleryState.isLoaded = nextIsLoaded
	}
}

const SLOT_COLUMNS = [-12, -6, 0, 6, 12]
const SLOT_ROWS = [-12, -6, 0, 6]

const checkIsSlotFree = (slot: Vec3T): boolean => {
	const isTaken = gallery.layout.projects.some((entry) => {
		const distanceX = entry.position[0] - slot[0]
		const distanceZ = entry.position[2] - slot[2]
		return Math.hypot(distanceX, distanceZ) < 2.5
	})
	return !isTaken
}

const findFreeSlot = (): Vec3T => {
	for (const row of SLOT_ROWS) {
		for (const column of SLOT_COLUMNS) {
			const slot: Vec3T = [column, 0, row]
			const isFree = checkIsSlotFree(slot)
			if (isFree) return slot
		}
	}

	const randomX = (Math.random() - 0.5) * (GALLERY_SIZE[0] - 8)
	const randomZ = (Math.random() - 0.5) * (GALLERY_SIZE[2] - 12)
	return [randomX, 0, randomZ]
}

const ensureLayoutEntries = (): void => {
	const knownIds = new Set(gallery.layout.projects.map((entry) => entry.projectId))
	const projectIds = new Set(gallery.projects.map((project) => project.id))
	gallery.layout.projects = gallery.layout.projects.filter((entry) => projectIds.has(entry.projectId))

	for (const project of gallery.projects) {
		const isKnown = knownIds.has(project.id)
		if (isKnown) continue
		gallery.layout.projects.push({ projectId: project.id, position: findFreeSlot() })
	}
}

export const loadGalleryState = async (): Promise<void> => {
	const loadedProjects = await loadAllProjects()
	const loadedLayout = await loadGallery()
	gallery.projects = loadedProjects
	gallery.layout = loadedLayout
	ensureLayoutEntries()
	gallery.isLoaded = true
}

export const persistLayout = async (): Promise<void> => {
	await saveGallery(gallery.layout)
}

export const findProject = (projectId: string): ProjectT | null => {
	const foundProject = gallery.projects.find((project) => project.id === projectId)
	return foundProject ?? null
}

export const findLayoutEntry = (projectId: string): GalleryEntryT | null => {
	const foundEntry = gallery.layout.projects.find((entry) => entry.projectId === projectId)
	return foundEntry ?? null
}

// Replaces (or adds) a project in the cache and storage.
export const storeProject = async (project: ProjectT): Promise<void> => {
	const isKnown = gallery.projects.some((existing) => existing.id === project.id)
	const otherProjects = gallery.projects.filter((existing) => existing.id !== project.id)
	gallery.projects = [...otherProjects, project]

	if (!isKnown) {
		gallery.layout.projects.push({ projectId: project.id, position: findFreeSlot() })
		await persistLayout()
	}

	await saveProjectRecord(project)
}

export const removeProject = async (projectId: string): Promise<void> => {
	gallery.projects = gallery.projects.filter((project) => project.id !== projectId)
	gallery.layout.projects = gallery.layout.projects.filter((entry) => entry.projectId !== projectId)
	await deleteProjectRecord(projectId)
	await persistLayout()
}

export const clampToGallery = (x: number, z: number): [number, number] => {
	const limitX = GALLERY_HALF_X - 2
	const limitZ = GALLERY_HALF_Z - 2
	const clampedX = Math.min(Math.max(x, -limitX), limitX)
	const clampedZ = Math.min(Math.max(z, -limitZ), limitZ)
	return [clampedX, clampedZ]
}

export const moveLayoutEntry = (projectId: string, x: number, z: number): void => {
	const entry = findLayoutEntry(projectId)
	if (!entry) return
	const clamped = clampToGallery(x, z)
	entry.position = [clamped[0], 0, clamped[1]]
}
