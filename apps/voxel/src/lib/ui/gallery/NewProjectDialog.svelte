<script lang="ts">
	import { DEFAULT_ROOM_SIZE, clampRoomSize } from '../../model/project'
	import { MAX_ROOM_SIZE, MIN_ROOM_SIZE } from '../../model/cellKey'
	import { createAndOpenProject } from '../../state/navigation'
	import { closeOverlay, ui } from '../../state/ui.svelte'
	import type { Vec3T } from '../../model/types'
	import './ProjectDialogs.css'

	const isOpen = $derived(ui.overlay === 'newProject')
	let projectName = $state('Untitled')
	let roomWidth = $state(DEFAULT_ROOM_SIZE[0])
	let roomHeight = $state(DEFAULT_ROOM_SIZE[1])
	let roomDepth = $state(DEFAULT_ROOM_SIZE[2])

	const trimmedName = $derived(projectName.trim())
	const canCreate = $derived(trimmedName.length > 0)
	const isCreateDisabled = $derived(!canCreate)

	const handleNameInput = (inputEvent: CustomEvent<{ value: string }>): void => {
		projectName = inputEvent.detail.value
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

	const handleCreate = async (): Promise<void> => {
		if (!canCreate) return
		const roomSize: Vec3T = [roomWidth, roomHeight, roomDepth]
		await createAndOpenProject(trimmedName, roomSize)
		projectName = 'Untitled'
	}

	const handleSubmit = (submitEvent: SubmitEvent): void => {
		submitEvent.preventDefault()
		handleCreate()
	}
</script>

<z-dialog {isOpen} heading="New project" description="Name it and size the room. You can change both later." size="small" onclose={closeOverlay}>
	<form class="project-form" onsubmit={handleSubmit}>
		<z-field label="Name">
			<z-input label="Name" value={projectName} oninput={handleNameInput}></z-input>
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
		<z-text size="xs" color="muted">One grid square is one voxel.</z-text>
	</form>
	<div slot="footer" class="project-footer">
		<z-button size="small" kind="ghost" tone="neutral" onclick={closeOverlay}>Cancel</z-button>
		<z-button size="small" kind="solid" tone="primary" isDisabled={isCreateDisabled} onclick={handleCreate}>Create and enter</z-button>
	</div>
</z-dialog>
