<script lang="ts">
	import { MAX_ROOM_SIZE, MIN_ROOM_SIZE } from '../../model/cellKey'
	import { clampRoomSize } from '../../model/project'
	import { countVoxelsOutside, renameOpenProject, resizeRoom } from '../../state/editor.svelte'
	import { closeOverlay, ui } from '../../state/ui.svelte'
	import type { ProjectMetaT, Vec3T } from '../../model/types'
	import '../gallery/ProjectDialogs.css'

	type ProjectSettingsDialogPropsT = {
		meta: ProjectMetaT
	}

	let props: ProjectSettingsDialogPropsT = $props()

	const isOpen = $derived(ui.overlay === 'projectSettings')
	let draftName = $state('')
	let roomWidth = $state(128)
	let roomHeight = $state(128)
	let roomDepth = $state(128)

	$effect(() => {
		if (!isOpen) return
		draftName = props.meta.name
		roomWidth = props.meta.roomSize[0]
		roomHeight = props.meta.roomSize[1]
		roomDepth = props.meta.roomSize[2]
	})

	const trimmedName = $derived(draftName.trim())
	const nextSize = $derived<Vec3T>([roomWidth, roomHeight, roomDepth])
	const outsideCount = $derived(isOpen ? countVoxelsOutside(nextSize) : 0)
	const hasLoss = $derived(outsideCount > 0)
	const lossLabel = $derived(`${outsideCount.toLocaleString()} voxels sit outside the new size and will be removed. You can undo this.`)
	const isSaveDisabled = $derived(trimmedName.length === 0)
	const saveTone = $derived(hasLoss ? 'danger' : 'primary')

	const handleNameInput = (inputEvent: CustomEvent<{ value: string }>): void => {
		draftName = inputEvent.detail.value
	}

	const handleWidth = (changeEvent: CustomEvent<{ value: number }>): void => {
		roomWidth = clampRoomSize(changeEvent.detail.value)
	}

	const handleHeight = (changeEvent: CustomEvent<{ value: number }>): void => {
		roomHeight = clampRoomSize(changeEvent.detail.value)
	}

	const handleDepth = (changeEvent: CustomEvent<{ value: number }>): void => {
		roomDepth = clampRoomSize(changeEvent.detail.value)
	}

	const handleSave = (): void => {
		if (isSaveDisabled) return
		const isNameChanged = trimmedName !== props.meta.name
		if (isNameChanged) renameOpenProject(trimmedName)
		const isSizeChanged = nextSize.join() !== props.meta.roomSize.join()
		if (isSizeChanged) resizeRoom(nextSize)
		closeOverlay()
	}

	const handleSubmit = (submitEvent: SubmitEvent): void => {
		submitEvent.preventDefault()
		handleSave()
	}
	import '../shared/Dialog.css'
</script>

<z-dialog {isOpen} heading="Project settings" description="The room is the model's bounding box." class="app-dialog isSmall" onclose={closeOverlay}>
	<form class="project-form" onsubmit={handleSubmit}>
		<z-field label="Name">
			<z-input label="Name" value={draftName} oninput={handleNameInput}></z-input>
		</z-field>
		<div class="project-size-row">
			<z-field label="Width">
				<z-number-input label="Width" isFullWidth value={roomWidth} min={MIN_ROOM_SIZE} max={MAX_ROOM_SIZE} step={8} onchange={handleWidth}></z-number-input>
			</z-field>
			<z-field label="Height">
				<z-number-input label="Height" isFullWidth value={roomHeight} min={MIN_ROOM_SIZE} max={MAX_ROOM_SIZE} step={8} onchange={handleHeight}></z-number-input>
			</z-field>
			<z-field label="Depth">
				<z-number-input label="Depth" isFullWidth value={roomDepth} min={MIN_ROOM_SIZE} max={MAX_ROOM_SIZE} step={8} onchange={handleDepth}></z-number-input>
			</z-field>
		</div>
		{#if hasLoss}
			<z-text size="xs" color="muted">{lossLabel}</z-text>
		{/if}
	</form>
	<div slot="footer" class="project-footer">
		<z-button size="sm" kind="ghost" tone="neutral" onclick={closeOverlay}>Cancel</z-button>
		<z-button size="sm" kind="solid" tone={saveTone} isDisabled={isSaveDisabled} onclick={handleSave}>Save</z-button>
	</div>
</z-dialog>
