<script lang="ts">
	import type { IconT } from '../icons'
	import KeyCombo from './KeyCombo.svelte'
	import './MenuItem.css'

	type MenuItemPropsT = {
		label: string
		icon: IconT
		combo?: string
		isDanger?: boolean
		onselect: () => void
	}

	let props: MenuItemPropsT = $props()

	const itemClass = $derived(props.isDanger ? 'menu-item isDanger' : 'menu-item')
	const hasCombo = $derived(typeof props.combo === 'string' && props.combo.length > 0)
	const Icon = $derived(props.icon)
</script>

<button type="button" class={itemClass} onclick={props.onselect}>
	<Icon size={16} weight="bold" />
	<span class="menu-item-label">{props.label}</span>
	{#if hasCombo && props.combo}
		<KeyCombo combo={props.combo} size="xs" />
	{/if}
</button>
