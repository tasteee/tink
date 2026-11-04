<script lang="ts">
	import CheckCircleIcon from 'phosphor-svelte/lib/CheckCircleIcon'
	import ArrowsOutCardinalIcon from 'phosphor-svelte/lib/ArrowsOutCardinalIcon'
	import PencilSimpleIcon from 'phosphor-svelte/lib/PencilSimpleIcon'
	import EyeSlashIcon from 'phosphor-svelte/lib/EyeSlashIcon'
	import LockIcon from 'phosphor-svelte/lib/LockIcon'
	import CrosshairIcon from 'phosphor-svelte/lib/CrosshairIcon'
	import TreeStructureIcon from 'phosphor-svelte/lib/TreeStructureIcon'
	import TrashIcon from 'phosphor-svelte/lib/TrashIcon'
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon'
	import GearIcon from 'phosphor-svelte/lib/GearIcon'
	import HouseIcon from 'phosphor-svelte/lib/HouseIcon'
	import SelectionIcon from 'phosphor-svelte/lib/SelectionIcon'
	import MenuItem from '../shared/MenuItem.svelte'
	import { findGroup } from '../../model/groups'
	import { countGroupVoxels } from '../../model/voxelDoc'
	import {
		createEmptyGroup,
		deleteGroup,
		editor,
		resetGroupPivot,
		selectGroup,
		selection,
		setActiveGroup,
		toggleGroupHidden,
		toggleGroupLocked,
		unnestGroup
	} from '../../state/editor.svelte'
	import { setTool } from '../../state/controls'
	import { returnToGallery } from '../../state/navigation'
	import { buildCloseHandler, closeOverlay, openOverlay, ui } from '../../state/ui.svelte'
	import type { ProjectMetaT } from '../../model/types'
	import '../shared/MenuItem.css'

	type AimMenuDialogPropsT = {
		meta: ProjectMetaT
	}

	let props: AimMenuDialogPropsT = $props()

	// E opens this for whatever you aim at: a group, or the room.
	const isOpen = $derived(ui.overlay === 'aimMenu')
	const group = $derived(findGroup(props.meta.groups, ui.overlayGroupId))
	const hasGroup = $derived(group !== null)
	const isActiveGroup = $derived(group !== null && group.id === props.meta.activeGroupId)
	const hasParent = $derived(group !== null && group.parentId !== null)
	const hasSelection = $derived(selection.size > 0)
	const heading = $derived(group ? group.name : 'Room')
	const voxelCount = $derived(group ? countGroupVoxels(group.id) : 0)
	const groupDescription = $derived(`${voxelCount.toLocaleString()} voxels`)
	const roomDescription = $derived(props.meta.roomSize.join(' × '))
	const description = $derived(hasGroup ? groupDescription : roomDescription)
	const hideLabel = $derived(group?.isHidden ? 'Show' : 'Hide')
	const lockLabel = $derived(group?.isLocked ? 'Unlock' : 'Lock')

	const runAndClose = (action: () => void): void => {
		closeOverlay()
		action()
	}

	const makeActive = (): void => runAndClose(() => setActiveGroup(ui.overlayGroupId))

	const selectForObjectMode = (): void => {
		runAndClose(() => {
			selectGroup(ui.overlayGroupId)
			setTool('object')
		})
	}

	const editPivot = (): void => {
		runAndClose(() => {
			editor.selectedGroupId = ui.overlayGroupId
			setTool('pivot')
		})
	}

	const rename = (): void => openOverlay('renameGroup')
	const toggleHidden = (): void => runAndClose(() => toggleGroupHidden(ui.overlayGroupId))
	const toggleLocked = (): void => runAndClose(() => toggleGroupLocked(ui.overlayGroupId))
	const resetPivot = (): void => runAndClose(() => resetGroupPivot(ui.overlayGroupId))
	const unnest = (): void => runAndClose(() => unnestGroup(ui.overlayGroupId))
	const removeGroup = (): void => runAndClose(() => deleteGroup(ui.overlayGroupId))
	const groupSelectedVoxels = (): void => openOverlay('nameGroup')

	const addGroup = (): void => {
		const groupNumber = props.meta.groups.length + 1
		runAndClose(() => createEmptyGroup(`Group ${groupNumber}`))
	}

	const openSettings = (): void => openOverlay('projectSettings')
	const goToGallery = (): void => runAndClose(() => returnToGallery())
	import '../shared/Dialog.css'
	const handleDialogClose = buildCloseHandler('aimMenu')
</script>

<z-dialog {isOpen} {heading} {description} class="app-dialog isSmall" onclose={handleDialogClose}>
	<div class="menu-list">
		{#if hasGroup}
			{#if !isActiveGroup}
				<MenuItem label="Make active" icon={CheckCircleIcon} onselect={makeActive} />
			{/if}
			<MenuItem label="Select to move" icon={ArrowsOutCardinalIcon} onselect={selectForObjectMode} />
			<MenuItem label="Rename" icon={PencilSimpleIcon} onselect={rename} />
			<MenuItem label={hideLabel} icon={EyeSlashIcon} onselect={toggleHidden} />
			<MenuItem label={lockLabel} icon={LockIcon} onselect={toggleLocked} />
			<div class="menu-separator"></div>
			<MenuItem label="Move pivot" icon={CrosshairIcon} onselect={editPivot} />
			<MenuItem label="Reset pivot to center" icon={CrosshairIcon} onselect={resetPivot} />
			{#if hasParent}
				<MenuItem label="Move out of parent" icon={TreeStructureIcon} onselect={unnest} />
			{/if}
		{/if}
		{#if hasSelection}
			<MenuItem label="Group selection" icon={SelectionIcon} onselect={groupSelectedVoxels} />
		{/if}
		{#if hasGroup}
			<div class="menu-separator"></div>
			<MenuItem label="Delete group" icon={TrashIcon} isDanger onselect={removeGroup} />
		{:else}
			<MenuItem label="New group" icon={PlusIcon} onselect={addGroup} />
			<MenuItem label="Project settings" icon={GearIcon} onselect={openSettings} />
			<MenuItem label="Back to gallery" icon={HouseIcon} onselect={goToGallery} />
		{/if}
	</div>
</z-dialog>
