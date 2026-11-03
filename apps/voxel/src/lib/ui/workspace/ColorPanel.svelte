<script lang="ts">
	import PlusIcon from 'phosphor-svelte/lib/PlusIcon'
	import SwatchesIcon from 'phosphor-svelte/lib/SwatchesIcon'
	import Panel from '../shared/Panel.svelte'
	import Swatch from '../shared/Swatch.svelte'
	import { addSelectedColorToPalette, editor, removeFromPalette, selectColor } from '../../state/editor.svelte'
	import type { ProjectMetaT } from '../../model/types'
	import './ColorPanel.css'

	type ColorPanelPropsT = {
		meta: ProjectMetaT
	}

	let props: ColorPanelPropsT = $props()

	type SwatchEntryT = {
		colorIndex: number
		color: string
	}

	const toSwatchEntries = (colorIndexes: number[]): SwatchEntryT[] => {
		const entries = colorIndexes.map((colorIndex) => ({ colorIndex, color: props.meta.colors[colorIndex] ?? '' }))
		return entries.filter((entry) => entry.color !== '')
	}

	const paletteEntries = $derived(toSwatchEntries(props.meta.palette))
	const recentEntries = $derived(toSwatchEntries(props.meta.recentColors))
	const hasRecents = $derived(recentEntries.length > 0)
	const hasPalette = $derived(paletteEntries.length > 0)
	const selectedHex = $derived(editor.selectedColor.toUpperCase())

	const checkIsSelected = (color: string): boolean => {
		return color.toLowerCase() === editor.selectedColor
	}

	const handlePickerChange = (changeEvent: CustomEvent<{ value: string }>): void => {
		selectColor(changeEvent.detail.value)
	}

	const toggleProjectColors = (): void => {
		editor.isProjectColorsOpen = !editor.isProjectColorsOpen
	}
</script>

<Panel title="Color">
	{#snippet actions()}
		<z-button size="small" kind="ghost" tone="neutral" onclick={toggleProjectColors} aria-label="Project colors" title="Project colors">
			<SwatchesIcon size={16} weight="bold" />
		</z-button>
	{/snippet}

	<div class="color-current">
		<z-color-picker value={editor.selectedColor} onchange={handlePickerChange}></z-color-picker>
		<div class="color-current-text">
			<z-text size="sm" weight="600">{selectedHex}</z-text>
			<z-text size="xs" color="muted">Selected</z-text>
		</div>
		<z-button size="small" kind="soft" tone="neutral" onclick={addSelectedColorToPalette} aria-label="Add to palette" title="Add to palette">
			<PlusIcon size={14} weight="bold" />
		</z-button>
	</div>

	<div class="color-group">
		<z-text size="xs" color="muted">Palette</z-text>
		{#if hasPalette}
			<div class="color-swatches">
				{#each paletteEntries as entry (entry.colorIndex)}
					<Swatch color={entry.color} isSelected={checkIsSelected(entry.color)} onselect={() => selectColor(entry.color)} oncontext={() => removeFromPalette(entry.colorIndex)} />
				{/each}
			</div>
		{:else}
			<z-text size="xs" color="muted">Add the selected color with +</z-text>
		{/if}
	</div>

	{#if hasRecents}
		<div class="color-group">
			<z-text size="xs" color="muted">Recent</z-text>
			<div class="color-swatches">
				{#each recentEntries as entry (entry.colorIndex)}
					<Swatch color={entry.color} isSelected={checkIsSelected(entry.color)} onselect={() => selectColor(entry.color)} />
				{/each}
			</div>
		</div>
	{/if}
</Panel>
