<script lang="ts">
	import KeyCombo from './KeyCombo.svelte'
	import { ACTIONS, checkIsModifierCode, getComboFromEvent, keymap, resetBindings, setBinding } from '../../state/keymap.svelte'
	import type { ActionIdT, ActionInfoT } from '../../state/keymap.svelte'
	import { closeOverlay, ui } from '../../state/ui.svelte'
	import './KeymapDialog.css'

	const SECTIONS: ActionInfoT['section'][] = ['Move', 'Build', 'Groups', 'App']
	let listeningActionId = $state<ActionIdT | ''>('')

	const isOpen = $derived(ui.overlay === 'keymap')

	const getSectionActions = (section: ActionInfoT['section']): ActionInfoT[] => {
		return ACTIONS.filter((action) => action.section === section)
	}

	const findConflict = (actionId: ActionIdT, combo: string): ActionInfoT | null => {
		const conflict = ACTIONS.find((action) => action.id !== actionId && keymap[action.id] === combo)
		return conflict ?? null
	}

	const getRowClass = (actionId: ActionIdT): string => {
		const isListening = listeningActionId === actionId
		if (isListening) return 'keymap-row isListening'
		return 'keymap-row'
	}

	const getConflictLabel = (actionId: ActionIdT): string => {
		const conflict = findConflict(actionId, keymap[actionId])
		if (!conflict) return ''
		return `Also ${conflict.label}`
	}

	const startListening = (actionId: ActionIdT): void => {
		listeningActionId = actionId
	}

	// While listening, the next key press becomes the binding.
	// Held actions bind a single key; Esc cancels.
	const handleCaptureKey = (keyEvent: KeyboardEvent): void => {
		const actionId = listeningActionId
		if (actionId === '') return
		keyEvent.preventDefault()
		keyEvent.stopPropagation()
		const isCancel = keyEvent.code === 'Escape'

		if (isCancel) {
			listeningActionId = ''
			return
		}

		const action = ACTIONS.find((candidate) => candidate.id === actionId)
		const isHeld = action?.isHeld === true
		const isModifierOnly = checkIsModifierCode(keyEvent.code)
		const isWaitingForMainKey = isModifierOnly && !isHeld
		if (isWaitingForMainKey) return
		const combo = isHeld ? keyEvent.code : getComboFromEvent(keyEvent)
		setBinding(actionId, combo)
		listeningActionId = ''
	}

	const handleClose = (): void => {
		listeningActionId = ''
		closeOverlay()
	}

	$effect(() => {
		const isListening = listeningActionId !== ''
		if (!isListening) return
		window.addEventListener('keydown', handleCaptureKey, true)
		return () => window.removeEventListener('keydown', handleCaptureKey, true)
	})
	import './Dialog.css'
</script>

<z-dialog {isOpen} heading="Keyboard" description="Every action has a key. Click Change, then press the new key." class="app-dialog isLarge" onclose={handleClose}>
	<div class="keymap-body">
		{#each SECTIONS as section (section)}
			<section class="keymap-section">
				<z-eyebrow label={section}></z-eyebrow>
				{#each getSectionActions(section) as action (action.id)}
					<div class={getRowClass(action.id)}>
						<span class="keymap-label">{action.label}</span>
						<span class="keymap-conflict">{getConflictLabel(action.id)}</span>
						{#if listeningActionId === action.id}
							<span class="keymap-listening">Press a key…</span>
						{:else}
							<KeyCombo combo={keymap[action.id]} />
						{/if}
						<z-button size="sm" kind="ghost" tone="neutral" onclick={() => startListening(action.id)}>Change</z-button>
					</div>
				{/each}
			</section>
		{/each}
		<div class="keymap-row">
			<span class="keymap-label">Eyedropper</span>
			<span class="keymap-conflict"></span>
			<span class="keymap-fixed">Alt + click</span>
			<span></span>
		</div>
	</div>
	<div slot="footer" class="keymap-footer">
		<z-button size="sm" kind="ghost" tone="neutral" onclick={resetBindings}>Reset to defaults</z-button>
		<z-button size="sm" kind="solid" tone="primary" onclick={handleClose}>Done</z-button>
	</div>
</z-dialog>
