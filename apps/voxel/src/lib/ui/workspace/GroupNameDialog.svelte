<script lang="ts">
	import { findGroup } from '../../model/groups'
	import { groupSelection, renameGroup, selection } from '../../state/editor.svelte'
	import { closeOverlay, ui } from '../../state/ui.svelte'
	import type { ProjectMetaT } from '../../model/types'
	import '../gallery/ProjectDialogs.css'

	type GroupNameDialogPropsT = {
		meta: ProjectMetaT
	}

	let props: GroupNameDialogPropsT = $props()

	// Names a new group made from the selection, or renames one.
	const isNaming = $derived(ui.overlay === 'nameGroup')
	const isRenaming = $derived(ui.overlay === 'renameGroup')
	const isOpen = $derived(isNaming || isRenaming)
	const heading = $derived(isNaming ? 'Group selection' : 'Rename group')
	const selectionDescription = $derived(`${selection.size.toLocaleString()} voxels move into a new group under the active one.`)
	const description = $derived(isNaming ? selectionDescription : '')
	const confirmLabel = $derived(isNaming ? 'Create group' : 'Save')

	let draftName = $state('')
	const trimmedName = $derived(draftName.trim())
	const isConfirmDisabled = $derived(trimmedName.length === 0)

	$effect(() => {
		if (isNaming) {
			draftName = `Group ${props.meta.groups.length + 1}`
			return
		}

		if (!isRenaming) return
		const group = findGroup(props.meta.groups, ui.overlayGroupId)
		draftName = group ? group.name : ''
	})

	const handleInput = (inputEvent: CustomEvent<{ value: string }>): void => {
		draftName = inputEvent.detail.value
	}

	const handleConfirm = (): void => {
		if (isConfirmDisabled) return
		const name = trimmedName
		const wasNaming = isNaming
		closeOverlay()
		if (wasNaming) return groupSelection(name)
		renameGroup(ui.overlayGroupId, name)
	}

	const handleSubmit = (submitEvent: SubmitEvent): void => {
		submitEvent.preventDefault()
		handleConfirm()
	}
</script>

<z-dialog {isOpen} {heading} {description} size="small" onclose={closeOverlay}>
	<form class="project-form" onsubmit={handleSubmit}>
		<z-field label="Name">
			<z-input label="Name" value={draftName} oninput={handleInput}></z-input>
		</z-field>
	</form>
	<div slot="footer" class="project-footer">
		<z-button size="small" kind="ghost" tone="neutral" onclick={closeOverlay}>Cancel</z-button>
		<z-button size="small" kind="solid" tone="primary" isDisabled={isConfirmDisabled} onclick={handleConfirm}>{confirmLabel}</z-button>
	</div>
</z-dialog>
