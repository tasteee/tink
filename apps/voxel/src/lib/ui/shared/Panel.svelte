<script lang="ts">
	import type { Snippet } from 'svelte'
	import './Panel.css'

	// A floating, flat panel: title row, then content.
	type PanelPropsT = {
		title: string
		actions?: Snippet
		children: Snippet
	}

	let props: PanelPropsT = $props()
</script>

<section class="panel">
	<header class="panel-header">
		<z-text size="xs" weight={600} color="muted">{props.title}</z-text>
		{#if props.actions}
			<div class="panel-actions">{@render props.actions()}</div>
		{/if}
	</header>
	<div class="panel-body">{@render props.children()}</div>
</section>
