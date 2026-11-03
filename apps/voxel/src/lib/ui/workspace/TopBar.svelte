<script lang="ts">
	import HouseIcon from 'phosphor-svelte/lib/HouseIcon'
	import ArrowUUpLeftIcon from 'phosphor-svelte/lib/ArrowUUpLeftIcon'
	import ArrowUUpRightIcon from 'phosphor-svelte/lib/ArrowUUpRightIcon'
	import SunIcon from 'phosphor-svelte/lib/SunIcon'
	import PaletteIcon from 'phosphor-svelte/lib/PaletteIcon'
	import StackIcon from 'phosphor-svelte/lib/StackIcon'
	import ExportIcon from 'phosphor-svelte/lib/ExportIcon'
	import GearIcon from 'phosphor-svelte/lib/GearIcon'
	import KeyboardIcon from 'phosphor-svelte/lib/KeyboardIcon'
	import { editor, redo, undo } from '../../state/editor.svelte'
	import { returnToGallery } from '../../state/navigation'
	import { getActionLabelKeys } from '../../state/keymap.svelte'
	import { openOverlay, ui } from '../../state/ui.svelte'
	import type { ProjectMetaT } from '../../model/types'
	import './TopBar.css'

	type TopBarPropsT = {
		meta: ProjectMetaT
	}

	let props: TopBarPropsT = $props()

	const saveLabel = $derived(editor.isSaving ? 'Saving…' : 'Saved')
	const isRenderView = $derived(editor.viewMode === 'render')
	const viewKind = $derived(isRenderView ? 'solid' : 'ghost')
	const viewTone = $derived(isRenderView ? 'primary' : 'neutral')
	const colorsKind = $derived(editor.isColorsOpen ? 'soft' : 'ghost')
	const groupsKind = $derived(editor.isGroupsOpen ? 'soft' : 'ghost')
	const isUndoDisabled = $derived(!editor.canUndo)
	const isRedoDisabled = $derived(!editor.canRedo)
	const viewTitle = $derived(`Render view (${getActionLabelKeys('toggleRenderView')})`)
	const backTitle = $derived(`Back to gallery (${getActionLabelKeys('backToGallery')})`)

	const toggleView = (): void => {
		editor.viewMode = isRenderView ? 'flat' : 'render'
	}

	const toggleColors = (): void => {
		editor.isColorsOpen = !editor.isColorsOpen
	}

	const toggleGroups = (): void => {
		editor.isGroupsOpen = !editor.isGroupsOpen
	}

	const openExport = (): void => {
		ui.overlayProjectId = props.meta.id
		openOverlay('exportProject')
	}

	const openSettings = (): void => {
		openOverlay('projectSettings')
	}

	const openKeymap = (): void => {
		openOverlay('keymap')
	}
</script>

<header class="top-bar">
	<div class="top-bar-cluster">
		<z-button size="small" kind="ghost" tone="neutral" onclick={returnToGallery} title={backTitle} aria-label="Back to gallery">
			<HouseIcon size={16} weight="bold" />
		</z-button>
		<span class="top-bar-divider"></span>
		<div class="top-bar-title">
			<z-text size="sm" weight="600">{props.meta.name}</z-text>
			<z-text size="xs" color="muted">{saveLabel}</z-text>
		</div>
	</div>

	<div class="top-bar-cluster">
		<z-button size="small" kind="ghost" tone="neutral" isDisabled={isUndoDisabled} onclick={undo} title="Undo" aria-label="Undo">
			<ArrowUUpLeftIcon size={16} weight="bold" />
		</z-button>
		<z-button size="small" kind="ghost" tone="neutral" isDisabled={isRedoDisabled} onclick={redo} title="Redo" aria-label="Redo">
			<ArrowUUpRightIcon size={16} weight="bold" />
		</z-button>
		<span class="top-bar-divider"></span>
		<z-button size="small" kind={viewKind} tone={viewTone} onclick={toggleView} title={viewTitle}>
			<SunIcon size={16} weight="bold" />
			Render
		</z-button>
		<z-button size="small" kind={colorsKind} tone="neutral" onclick={toggleColors} title="Colors panel" aria-label="Colors panel">
			<PaletteIcon size={16} weight="bold" />
		</z-button>
		<z-button size="small" kind={groupsKind} tone="neutral" onclick={toggleGroups} title="Groups panel" aria-label="Groups panel">
			<StackIcon size={16} weight="bold" />
		</z-button>
		<span class="top-bar-divider"></span>
		<z-button size="small" kind="ghost" tone="neutral" onclick={openExport} title="Export" aria-label="Export">
			<ExportIcon size={16} weight="bold" />
		</z-button>
		<z-button size="small" kind="ghost" tone="neutral" onclick={openSettings} title="Project settings" aria-label="Project settings">
			<GearIcon size={16} weight="bold" />
		</z-button>
		<z-button size="small" kind="ghost" tone="neutral" onclick={openKeymap} title="Keyboard" aria-label="Keyboard">
			<KeyboardIcon size={16} weight="bold" />
		</z-button>
	</div>
</header>
