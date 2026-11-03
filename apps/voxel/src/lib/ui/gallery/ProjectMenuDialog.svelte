<script lang="ts">
	import FolderOpenIcon from 'phosphor-svelte/lib/FolderOpenIcon'
	import PencilSimpleIcon from 'phosphor-svelte/lib/PencilSimpleIcon'
	import ArrowsOutCardinalIcon from 'phosphor-svelte/lib/ArrowsOutCardinalIcon'
	import CopyIcon from 'phosphor-svelte/lib/CopyIcon'
	import ExportIcon from 'phosphor-svelte/lib/ExportIcon'
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon'
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon'
	import UploadSimpleIcon from 'phosphor-svelte/lib/UploadSimpleIcon'
	import MenuItem from '../shared/MenuItem.svelte'
	import { NEW_PEDESTAL_ID, findProject, gallery } from '../../state/gallery.svelte'
	import { duplicateProject, importProjectFile, openProject } from '../../state/navigation'
	import { closeOverlay, openOverlay, ui } from '../../state/ui.svelte'
	import { countProjectVoxels } from '../../model/project'
	import '../shared/MenuItem.css'

	const isOpen = $derived(ui.overlay === 'projectMenu')
	const isNewPedestal = $derived(ui.overlayProjectId === NEW_PEDESTAL_ID)
	const project = $derived(findProject(ui.overlayProjectId))
	const heading = $derived(project ? project.name : 'New project')
	const voxelCount = $derived(project ? countProjectVoxels(project) : 0)
	const sizeLabel = $derived(project ? project.roomSize.join(' × ') : '')
	const description = $derived(project ? `${voxelCount.toLocaleString()} voxels · ${sizeLabel} room` : 'Start fresh or bring in a .vx file')

	const handleOpen = (): void => {
		openProject(ui.overlayProjectId)
	}

	const handleRename = (): void => {
		openOverlay('renameProject')
	}

	const handleMove = (): void => {
		gallery.movingProjectId = ui.overlayProjectId
		closeOverlay()
	}

	const handleDuplicate = async (): Promise<void> => {
		closeOverlay()
		await duplicateProject(ui.overlayProjectId)
	}

	const handleExport = (): void => {
		openOverlay('exportProject')
	}

	const handleDelete = (): void => {
		openOverlay('deleteProject')
	}

	const handleNew = (): void => {
		openOverlay('newProject')
	}

	const handleImport = async (): Promise<void> => {
		closeOverlay()
		await importProjectFile()
	}
</script>

<z-dialog {isOpen} {heading} {description} size="small" onclose={closeOverlay}>
	<div class="menu-list">
		{#if isNewPedestal}
			<MenuItem label="New project" icon={PlusIcon} onselect={handleNew} />
			<MenuItem label="Import project" icon={UploadSimpleIcon} onselect={handleImport} />
		{:else}
			<MenuItem label="Open" icon={FolderOpenIcon} onselect={handleOpen} />
			<MenuItem label="Rename" icon={PencilSimpleIcon} onselect={handleRename} />
			<MenuItem label="Move" icon={ArrowsOutCardinalIcon} onselect={handleMove} />
			<MenuItem label="Duplicate" icon={CopyIcon} onselect={handleDuplicate} />
			<MenuItem label="Export" icon={ExportIcon} onselect={handleExport} />
			<div class="menu-separator"></div>
			<MenuItem label="Delete" icon={TrashIcon} isDanger onselect={handleDelete} />
		{/if}
	</div>
</z-dialog>
