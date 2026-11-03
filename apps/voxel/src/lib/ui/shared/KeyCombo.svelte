<script lang="ts">
	import { formatComboParts } from '../../state/keymap.svelte'
	import './KeyCombo.css'

	type KeyComboPropsT = {
		combo: string
		size?: string
	}

	let props: KeyComboPropsT = $props()

	const parts = $derived(formatComboParts(props.combo))
	const keySize = $derived(props.size ?? 'sm')
</script>

<span class="key-combo">
	{#each parts as part, partIndex (partIndex)}
		<z-kbd size={keySize}>{part}</z-kbd>
	{/each}
</span>
