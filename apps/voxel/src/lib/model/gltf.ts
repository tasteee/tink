import { Mesh, MeshStandardMaterial, Object3D, Scene } from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { toCellKey, toCellKeyFromVec } from './cellKey'
import { buildColorTable, buildVoxelGeometry } from './mesher'
import type { CellT, GroupT, ProjectT, Vec3T } from './types'

// 1 voxel = 10 cm in the exported scene.
export const EXPORT_VOXEL_SIZE = 0.1

type ProjectCellsT = {
	cells: Map<number, CellT>
	keysByGroup: Map<string, number[]>
}

const indexProjectCells = (project: ProjectT): ProjectCellsT => {
	const cells = new Map<number, CellT>()
	const keysByGroup = new Map<string, number[]>()

	for (const group of project.groups) {
		const groupKeys: number[] = []

		for (const voxel of group.voxels) {
			const key = toCellKeyFromVec(voxel.position)
			cells.set(key, { groupId: group.id, colorIndex: voxel.colorIndex, shape: voxel.shape, rotation: voxel.rotation })
			groupKeys.push(key)
		}

		keysByGroup.set(group.id, groupKeys)
	}

	return { cells, keysByGroup }
}

const getModelOrigin = (project: ProjectT): Vec3T => {
	return [project.roomSize[0] / 2, 0, project.roomSize[2] / 2]
}

type ExportContextT = {
	project: ProjectT
	indexed: ProjectCellsT
	material: MeshStandardMaterial
}

const buildGroupNode = (context: ExportContextT, group: GroupT, parentPivot: Vec3T): Object3D => {
	const node = new Object3D()
	node.name = group.name
	node.position.set(
		(group.pivot[0] - parentPivot[0]) * EXPORT_VOXEL_SIZE,
		(group.pivot[1] - parentPivot[1]) * EXPORT_VOXEL_SIZE,
		(group.pivot[2] - parentPivot[2]) * EXPORT_VOXEL_SIZE
	)

	const groupKeys = context.indexed.keysByGroup.get(group.id) ?? []
	const hasVoxels = groupKeys.length > 0

	if (hasVoxels) {
		const geometry = buildVoxelGeometry({
			keys: groupKeys,
			getCell: (key) => context.indexed.cells.get(key) ?? null,
			checkIsBlocking: (x, y, z) => context.indexed.cells.get(toCellKey(x, y, z))?.groupId === group.id,
			colorTable: buildColorTable(context.project.colors),
			isFlatShaded: false,
			hasAmbientOcclusion: false,
			origin: group.pivot,
			scale: EXPORT_VOXEL_SIZE
		})

		const mesh = new Mesh(geometry, context.material)
		mesh.name = `${group.name} mesh`
		node.add(mesh)
	}

	const childGroups = context.project.groups.filter((candidate) => candidate.parentId === group.id)

	for (const childGroup of childGroups) {
		const childNode = buildGroupNode(context, childGroup, group.pivot)
		node.add(childNode)
	}

	return node
}

// One node per group, nested to match the group tree, with
// each pivot as its node origin.
export const buildExportScene = (project: ProjectT): Scene => {
	const scene = new Scene()
	scene.name = project.name
	const material = new MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 })
	const context: ExportContextT = { project, indexed: indexProjectCells(project), material }
	const rootGroups = project.groups.filter((group) => group.parentId === null)
	const modelOrigin = getModelOrigin(project)

	for (const rootGroup of rootGroups) {
		const rootNode = buildGroupNode(context, rootGroup, modelOrigin)
		scene.add(rootNode)
	}

	return scene
}

export const exportProjectToGltf = async (project: ProjectT, isBinary: boolean): Promise<Blob> => {
	const scene = buildExportScene(project)
	const exporter = new GLTFExporter()
	const result = await exporter.parseAsync(scene, { binary: isBinary, onlyVisible: false })
	const isArrayBuffer = result instanceof ArrayBuffer
	if (isArrayBuffer) return new Blob([result], { type: 'model/gltf-binary' })
	const jsonText = JSON.stringify(result)
	return new Blob([jsonText], { type: 'model/gltf+json' })
}
