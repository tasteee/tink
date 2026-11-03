<script lang="ts">
	import { EXPORT_VOXEL_SIZE } from '../../model/gltf'
	import { exportProject } from '../../state/navigation'
	import type { ExportFormatT } from '../../state/navigation'
	import { closeOverlay, showToast, ui } from '../../state/ui.svelte'
	import './ProjectDialogs.css'

	type ExportOptionT = {
		format: ExportFormatT
		name: string
		detail: string
	}

	const voxelSizeLabel = `${EXPORT_VOXEL_SIZE * 100} cm per voxel`

	const OPTIONS: ExportOptionT[] = [
		{ format: 'vx', name: 'Project .vx', detail: 'Full project. Opens here again.' },
		{ format: 'glb', name: 'glTF .glb', detail: `One file for games. ${voxelSizeLabel}.` },
		{ format: 'gltf', name: 'glTF .gltf', detail: `Readable JSON. ${voxelSizeLabel}.` }
	]

	const isOpen = $derived(ui.overlay === 'exportProject')

	const handleExport = async (format: ExportFormatT): Promise<void> => {
		closeOverlay()
		await exportProject(ui.overlayProjectId, format)
		showToast('Export ready')
	}
	import '../shared/Dialog.css'
</script>

<z-dialog {isOpen} heading="Export" description="glTF keeps one node per group, nested like your groups, with pivots as origins." class="app-dialog isMedium" onclose={closeOverlay}>
	<div class="export-options">
		{#each OPTIONS as option (option.format)}
			<button type="button" class="export-option" onclick={() => handleExport(option.format)}>
				<span class="export-option-name">{option.name}</span>
				<span class="export-option-detail">{option.detail}</span>
			</button>
		{/each}
	</div>
</z-dialog>
