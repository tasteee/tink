import type { GalleryT, ProjectT } from '../model/types'

// Tiny promise wrapper over IndexedDB. Two stores:
// projects (one record per project) and gallery (layout).
const DATABASE_NAME = 'voxel-editor'
const DATABASE_VERSION = 1
const PROJECT_STORE = 'projects'
const GALLERY_STORE = 'gallery'
const GALLERY_KEY = 'main'

let databasePromise: Promise<IDBDatabase> | null = null

const handleUpgrade = (request: IDBOpenDBRequest): void => {
	const database = request.result
	const hasProjectStore = database.objectStoreNames.contains(PROJECT_STORE)
	if (!hasProjectStore) database.createObjectStore(PROJECT_STORE, { keyPath: 'id' })
	const hasGalleryStore = database.objectStoreNames.contains(GALLERY_STORE)
	if (!hasGalleryStore) database.createObjectStore(GALLERY_STORE)
}

const openDatabase = (): Promise<IDBDatabase> => {
	if (databasePromise) return databasePromise

	databasePromise = new Promise((resolve, reject) => {
		const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
		request.onupgradeneeded = () => handleUpgrade(request)
		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})

	return databasePromise
}

const waitForRequest = <ResultT>(request: IDBRequest<ResultT>): Promise<ResultT> => {
	return new Promise((resolve, reject) => {
		request.onsuccess = () => resolve(request.result)
		request.onerror = () => reject(request.error)
	})
}

const getStore = async (storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> => {
	const database = await openDatabase()
	const transaction = database.transaction(storeName, mode)
	return transaction.objectStore(storeName)
}

export const loadAllProjects = async (): Promise<ProjectT[]> => {
	const store = await getStore(PROJECT_STORE, 'readonly')
	const projects = await waitForRequest<ProjectT[]>(store.getAll())
	return projects
}

export const saveProjectRecord = async (project: ProjectT): Promise<void> => {
	const store = await getStore(PROJECT_STORE, 'readwrite')
	await waitForRequest(store.put(project))
}

export const deleteProjectRecord = async (projectId: string): Promise<void> => {
	const store = await getStore(PROJECT_STORE, 'readwrite')
	await waitForRequest(store.delete(projectId))
}

export const loadGallery = async (): Promise<GalleryT> => {
	const store = await getStore(GALLERY_STORE, 'readonly')
	const savedGallery = await waitForRequest<GalleryT | undefined>(store.get(GALLERY_KEY))
	return savedGallery ?? { projects: [] }
}

export const saveGallery = async (gallery: GalleryT): Promise<void> => {
	const store = await getStore(GALLERY_STORE, 'readwrite')
	const plainGallery: GalleryT = JSON.parse(JSON.stringify(gallery))
	await waitForRequest(store.put(plainGallery, GALLERY_KEY))
}
