<script lang="ts">
	import { findProject } from '../../state/gallery.svelte'
	import { renameProject } from '../../state/navigation'
	import { closeOverlay, ui } from '../../state/ui.svelte'
	import './ProjectDialogs.css'

	const isOpen = $derived(ui.overlay === 'renameProject')
	const project = $derived(findProject(ui.overlayProjectId))
	let draftName = $state('')
	const trimmedName = $derived(draftName.trim())
	const isSaveDisabled = $derived(trimmedName.length === 0)

	$effect(() => {
		const isOpening = isOpen && project !== null
		if (isOpening && project) draftName = project.name
	})

	const handleInput = (inputEvent: CustomEvent<{ value: string }>): void => {
		draftName = inputEvent.detail.value
	}

	const handleSave = async (): Promise<void> => {
		if (isSaveDisabled) return
		await renameProject(ui.overlayProjectId, trimmedName)
		closeOverlay()
	}

	const handleSubmit = (submitEvent: SubmitEvent): void => {
		submitEvent.preventDefault()
		handleSave()
	}
	import '../shared/Dialog.css'
</script>

<z-dialog {isOpen} heading="Rename project" class="app-dialog isSmall" onclose={closeOverlay}>
	<form class="project-form" onsubmit={handleSubmit}>
		<z-field label="Name">
			<z-input label="Name" value={draftName} oninput={handleInput}></z-input>
		</z-field>
	</form>
	<div slot="footer" class="project-footer">
		<z-button size="sm" kind="ghost" tone="neutral" onclick={closeOverlay}>Cancel</z-button>
		<z-button size="sm" kind="solid" tone="primary" isDisabled={isSaveDisabled} onclick={handleSave}>Save</z-button>
	</div>
</z-dialog>
