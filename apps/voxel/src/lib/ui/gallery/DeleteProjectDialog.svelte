<script lang="ts">
	import { findProject } from '../../state/gallery.svelte'
	import { deleteProject } from '../../state/navigation'
	import { closeOverlay, ui } from '../../state/ui.svelte'
	import './ProjectDialogs.css'

	const isOpen = $derived(ui.overlay === 'deleteProject')
	const project = $derived(findProject(ui.overlayProjectId))
	const projectName = $derived(project ? project.name : 'this project')
	const description = $derived(`${projectName} will be gone for good. Export it first if you want a copy.`)

	const handleDelete = async (): Promise<void> => {
		closeOverlay()
		await deleteProject(ui.overlayProjectId)
	}
	import '../shared/Dialog.css'
</script>

<z-dialog {isOpen} heading="Delete project?" {description} class="app-dialog isSmall" onclose={closeOverlay}>
	<div slot="footer" class="project-footer">
		<z-button size="sm" kind="ghost" tone="neutral" onclick={closeOverlay}>Keep it</z-button>
		<z-button size="sm" kind="solid" tone="danger" onclick={handleDelete}>Delete</z-button>
	</div>
</z-dialog>
