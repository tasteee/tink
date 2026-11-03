<script lang="ts">
	import EyeIcon from 'phosphor-svelte/lib/EyeIcon'
	import EyeSlashIcon from 'phosphor-svelte/lib/EyeSlashIcon'
	import LockIcon from 'phosphor-svelte/lib/LockIcon'
	import LockOpenIcon from 'phosphor-svelte/lib/LockOpenIcon'
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon'
	import Panel from '../shared/Panel.svelte'
	import { getGroupDepth, getGroupsInTreeOrder } from '../../model/groups'
	import { countGroupVoxels } from '../../model/voxelDoc'
	import { createEmptyGroup, editor, setActiveGroup, toggleGroupHidden, toggleGroupLocked } from '../../state/editor.svelte'
	import type { GroupMetaT, ProjectMetaT } from '../../model/types'
	import './GroupsPanel.css'

	type GroupsPanelPropsT = {
		meta: ProjectMetaT
	}

	let props: GroupsPanelPropsT = $props()

	type GroupRowT = {
		group: GroupMetaT
		depth: number
		voxelCount: number
		rowClass: string
	}

	const getRowClass = (group: GroupMetaT): string => {
		const classes = ['groups-row']
		const isActive = group.id === props.meta.activeGroupId
		if (isActive) classes.push('isActive')
		const isSelected = group.id === editor.selectedGroupId
		if (isSelected) classes.push('isSelected')
		if (group.isHidden) classes.push('isHidden')
		return classes.join(' ')
	}

	// docVersion only makes the rows re-run after edits.
	const countVoxelsAtVersion = (groupId: string, docVersion: number): number => {
		const isUnloaded = docVersion < 0
		if (isUnloaded) return 0
		return countGroupVoxels(groupId)
	}

	const rows = $derived.by(() => {
		const orderedGroups = getGroupsInTreeOrder(props.meta.groups)

		return orderedGroups.map((group) => {
			const row: GroupRowT = {
				group,
				depth: getGroupDepth(props.meta.groups, group.id),
				voxelCount: countVoxelsAtVersion(group.id, editor.docVersion),
				rowClass: getRowClass(group)
			}
			return row
		})
	})

	const addGroup = (): void => {
		const groupNumber = props.meta.groups.length + 1
		createEmptyGroup(`Group ${groupNumber}`)
	}
</script>

<Panel title="Groups">
	{#snippet actions()}
		<z-button size="sm" kind="ghost" tone="neutral" onclick={addGroup} aria-label="New group" title="New group">
			<PlusIcon size={14} weight="bold" />
		</z-button>
	{/snippet}

	<div class="groups-list">
		{#each rows as row (row.group.id)}
			<div class={row.rowClass} style:--group-depth={row.depth}>
				<button type="button" class="groups-name" onclick={() => setActiveGroup(row.group.id)}>
					<span class="groups-dot"></span>
					<span class="groups-label">{row.group.name}</span>
					<span class="groups-count">{row.voxelCount}</span>
				</button>
				<button type="button" class="groups-toggle" onclick={() => toggleGroupHidden(row.group.id)} aria-label="Toggle visibility" title="Hide / show">
					{#if row.group.isHidden}
						<EyeSlashIcon size={14} weight="bold" />
					{:else}
						<EyeIcon size={14} weight="bold" />
					{/if}
				</button>
				<button type="button" class="groups-toggle" onclick={() => toggleGroupLocked(row.group.id)} aria-label="Toggle lock" title="Lock / unlock">
					{#if row.group.isLocked}
						<LockIcon size={14} weight="bold" />
					{:else}
						<LockOpenIcon size={14} weight="bold" />
					{/if}
				</button>
			</div>
		{/each}
	</div>
	<z-text size="xs" color="muted">New voxels go into the active group. Aim and press E for more.</z-text>
</Panel>
