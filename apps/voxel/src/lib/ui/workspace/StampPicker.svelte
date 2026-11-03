<script lang="ts">
	import ArrowClockwiseIcon from 'phosphor-svelte/lib/ArrowClockwiseIcon'
	import KeyCombo from '../shared/KeyCombo.svelte'
	import { PREFABS } from '../../model/shapes'
	import type { PrefabT } from '../../model/shapes'
	import { editor } from '../../state/editor.svelte'
	import { keymap } from '../../state/keymap.svelte'
	import './StampPicker.css'

	// Small top-down preview of each prefab, on a 5x5 grid.
	const PREVIEW_SPAN = 5
	const PREVIEW_CELLS = Array.from({ length: PREVIEW_SPAN * PREVIEW_SPAN }, (_unused, position) => position)

	const checkIsFilled = (prefab: PrefabT, previewIndex: number): boolean => {
		const half = Math.floor(PREVIEW_SPAN / 2)
		const column = (previewIndex % PREVIEW_SPAN) - half
		const row = Math.floor(previewIndex / PREVIEW_SPAN) - half
		return prefab.cells.some((offset) => offset[0] === column && offset[1] === row)
	}

	const getCellClass = (prefab: PrefabT, previewIndex: number): string => {
		const isFilled = checkIsFilled(prefab, previewIndex)
		if (isFilled) return 'stamp-cell isFilled'
		return 'stamp-cell'
	}

	const getOptionClass = (prefab: PrefabT): string => {
		const isActive = prefab.id === editor.prefabId
		if (isActive) return 'stamp-option isActive'
		return 'stamp-option'
	}

	const turnLabel = $derived(`${editor.prefabTurns * 90}°`)

	const pickPrefab = (prefab: PrefabT): void => {
		editor.prefabId = prefab.id
	}

	const rotateStamp = (): void => {
		editor.prefabTurns = (editor.prefabTurns + 1) % 4
	}
</script>

<div class="stamp-picker">
	{#each PREFABS as prefab (prefab.id)}
		<button type="button" class={getOptionClass(prefab)} onclick={() => pickPrefab(prefab)} title={prefab.name}>
			<span class="stamp-grid">
				{#each PREVIEW_CELLS as previewIndex (previewIndex)}
					<span class={getCellClass(prefab, previewIndex)}></span>
				{/each}
			</span>
			<span class="stamp-name">{prefab.name}</span>
		</button>
	{/each}
	<span class="stamp-divider"></span>
	<button type="button" class="stamp-rotate" onclick={rotateStamp} title="Rotate stamp">
		<ArrowClockwiseIcon size={16} weight="bold" />
		<span class="stamp-name">{turnLabel}</span>
		<KeyCombo combo={keymap.rotate} size="xs" />
	</button>
</div>
