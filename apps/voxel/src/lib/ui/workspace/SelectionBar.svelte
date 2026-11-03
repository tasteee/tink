<script lang="ts">
	import KeyCombo from '../shared/KeyCombo.svelte'
	import { deleteSelection, paintSelection, selection } from '../../state/editor.svelte'
	import { keymap } from '../../state/keymap.svelte'
	import { openOverlay } from '../../state/ui.svelte'
	import './SelectionBar.css'

	const selectionLabel = $derived(selection.size === 1 ? '1 voxel' : `${selection.size.toLocaleString()} voxels`)

	const openGroupName = (): void => {
		openOverlay('nameGroup')
	}

	const clearSelection = (): void => {
		selection.clear()
	}
</script>

<div class="selection-bar">
	<z-text size="xs" weight={600}>{selectionLabel}</z-text>
	<span class="selection-divider"></span>
	<z-button size="sm" kind="ghost" tone="neutral" onclick={openGroupName}>
		Group <KeyCombo combo={keymap.groupSelection} size="xs" />
	</z-button>
	<z-button size="sm" kind="ghost" tone="neutral" onclick={paintSelection}>Paint</z-button>
	<z-button size="sm" kind="ghost" tone="danger" onclick={deleteSelection}>
		Delete <KeyCombo combo={keymap.deleteSelection} size="xs" />
	</z-button>
	<z-button size="sm" kind="ghost" tone="neutral" onclick={clearSelection}>Clear</z-button>
</div>
