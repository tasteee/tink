import { exportProjectToGltf } from '../model/gltf'
import { PROJECT_EXTENSION, cloneProjectWithNewIds, createProject, parseJsonText, parseProject, serializeProject } from '../model/project'
import type { ProjectT, Vec3T } from '../model/types'
import { downloadBlob, downloadText, pickTextFile, toSafeFileName } from '../storage/files'
import { closeEditor, editor, loadProjectIntoEditor, saveNow } from './editor.svelte'
import { GALLERY_SPAWN, findLayoutEntry, findProject, gallery, removeProject, storeProject } from './gallery.svelte'
import { placeCamera, resetHeldInput } from './input'
import { cancelToolSession } from './interaction'
import { closeOverlay, showToast, ui } from './ui.svelte'

const placeCameraInWorkspace = (project: ProjectT): void => {
	// Just behind the room center, looking down at the floor
	// where building starts.
	const roomSize = project.roomSize
	const spawnY = Math.max(4, Math.min(roomSize[1] * 0.12, 14))
	const spawnZ = Math.min(roomSize[2] / 2 + 18, roomSize[2] - 2)
	placeCamera(roomSize[0] / 2, spawnY, spawnZ, 0, -0.55)
}

export const openProject = (projectId: string): void => {
	const project = findProject(projectId)
	if (!project) return
	cancelToolSession()
	resetHeldInput()
	loadProjectIntoEditor(project)
	placeCameraInWorkspace(project)
	closeOverlay()
	ui.route = 'workspace'
}

export const returnToGallery = async (): Promise<void> => {
	const projectId = editor.meta?.id ?? ''
	cancelToolSession()
	resetHeldInput()
	await closeEditor()
	closeOverlay()
	ui.route = 'gallery'
	const entry = findLayoutEntry(projectId)
	if (!entry) return placeCamera(GALLERY_SPAWN[0], GALLERY_SPAWN[1], GALLERY_SPAWN[2], 0, -0.08)
	// land in front of the project you just left
	placeCamera(entry.position[0], 1.7, entry.position[2] + 5, 0, -0.12)
}

export const createAndOpenProject = async (name: string, roomSize: Vec3T): Promise<void> => {
	const project = createProject(name, roomSize)
	await storeProject(project)
	openProject(project.id)
}

export const renameProject = async (projectId: string, name: string): Promise<void> => {
	const project = findProject(projectId)
	if (!project) return
	await storeProject({ ...project, name })
}

export const duplicateProject = async (projectId: string): Promise<void> => {
	const project = findProject(projectId)
	if (!project) return
	const copy = cloneProjectWithNewIds(project, `${project.name} copy`)
	await storeProject(copy)
	showToast(`Duplicated ${project.name}`)
}

export const deleteProject = async (projectId: string): Promise<void> => {
	const project = findProject(projectId)
	if (!project) return
	await removeProject(projectId)
	showToast(`Deleted ${project.name}`)
}

export type ExportFormatT = 'vx' | 'glb' | 'gltf'

const getProjectForExport = async (projectId: string): Promise<ProjectT | null> => {
	const isOpenProject = editor.meta?.id === projectId
	if (isOpenProject) await saveNow()
	return findProject(projectId)
}

export const exportProject = async (projectId: string, format: ExportFormatT): Promise<void> => {
	const project = await getProjectForExport(projectId)
	if (!project) return
	const baseName = toSafeFileName(project.name)
	const isProjectFile = format === 'vx'

	if (isProjectFile) {
		downloadText(serializeProject(project), `${baseName}${PROJECT_EXTENSION}`)
		return
	}

	const isBinary = format === 'glb'
	const blob = await exportProjectToGltf(project, isBinary)
	downloadBlob(blob, `${baseName}.${format}`)
}

// Loads a .vx (or renamed .json) file as a new project.
export const importProjectFile = async (): Promise<void> => {
	const fileText = await pickTextFile('.vx,.json,application/json')
	if (fileText === null) return
	const parsedProject = parseProject(parseJsonText(fileText))

	if (!parsedProject) {
		showToast('That file is not a voxel project', 'danger')
		return
	}

	const hasSameId = gallery.projects.some((project) => project.id === parsedProject.id)
	const projectToStore = hasSameId ? cloneProjectWithNewIds(parsedProject, parsedProject.name) : parsedProject
	await storeProject(projectToStore)
	showToast(`Imported ${projectToStore.name}`)
}
