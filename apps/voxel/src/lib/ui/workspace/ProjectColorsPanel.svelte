<script lang="ts">
	import XIcon from 'phosphor-svelte/lib/XIcon'
	import Panel from '../shared/Panel.svelte'
	import Swatch from '../shared/Swatch.svelte'
	import { countColorUsage, editor, recolorProjectColor, selectColor } from '../../state/editor.svelte'
	import type { ProjectMetaT } from '../../model/types'
	import './ProjectColorsPanel.css'

	type ProjectColorsPanelPropsT = {
		meta: ProjectMetaT
	}

	let props: ProjectColorsPanelPropsT = $props()

	type UsedColorT = {
		colorIndex: number
		color: string
		count: number
	}

	// Every color used in the model, most used first. No cap.
	const usedColors = $derived.by(() => {
		const usage = countColorUsage(editor.docVersion)
		const entries: UsedColorT[] = []

		for (const [colorIndex, count] of usage) {
			const color = props.meta.colors[colorIndex] ?? ''
			entries.push({ colorIndex, color, count })
		}

		entries.sort((left, right) => right.count - left.count)
		return entries
	})

	const hasColors = $derived(usedColors.length > 0)
	let recolorIndex = $state(-1)
	const isRecoloring = $derived(recolorIndex >= 0)
	const recolorValue = $derived(props.meta.colors[recolorIndex] ?? '#ffffff')
	let recolorTimer: ReturnType<typeof setTimeout> | null = null

	const startRecolor = (colorIndex: number): void => {
		recolorIndex = colorIndex
	}

	const stopRecolor = (): void => {
		recolorIndex = -1
	}

	// The picker fires while dragging; one undo step per pause.
	const handleRecolorChange = (changeEvent: CustomEvent<{ value: string }>): void => {
		const nextColor = changeEvent.detail.value
		const targetIndex = recolorIndex
		if (recolorTimer) clearTimeout(recolorTimer)
		recolorTimer = setTimeout(() => recolorProjectColor(targetIndex, nextColor), 160)
	}

	const closePanel = (): void => {
		editor.isProjectColorsOpen = false
	}

	const formatCount = (count: number): string => {
		return count.toLocaleString()
	}
</script>

<div class="project-colors">
	<Panel title="Project colors">
		{#snippet actions()}
			<z-button size="small" kind="ghost" tone="neutral" onclick={closePanel} aria-label="Close">
				<XIcon size={14} weight="bold" />
			</z-button>
		{/snippet}

		{#if isRecoloring}
			<div class="project-colors-recolor">
				<z-color-picker value={recolorValue} onchange={handleRecolorChange}></z-color-picker>
				<z-text size="xs" color="muted">Recolors every block using it</z-text>
				<z-button size="small" kind="ghost" tone="neutral" onclick={stopRecolor}>Done</z-button>
			</div>
		{/if}

		{#if hasColors}
			<div class="project-colors-list">
				{#each usedColors as used (used.colorIndex)}
					<div class="project-colors-row">
						<Swatch color={used.color} isSelected={recolorIndex === used.colorIndex} onselect={() => startRecolor(used.colorIndex)} label="Recolor {used.color}" />
						<button type="button" class="project-colors-name" onclick={() => selectColor(used.color)}>{used.color.toUpperCase()}</button>
						<span class="project-colors-count">{formatCount(used.count)}</span>
					</div>
				{/each}
			</div>
		{:else}
			<z-text size="xs" color="muted">Colors appear here as you build.</z-text>
		{/if}
	</Panel>
</div>
