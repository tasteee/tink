<script lang="ts">
	import { ui } from '../../state/ui.svelte'
	import './Toasts.css'

	const getToastClass = (tone: string): string => {
		const isDanger = tone === 'danger'
		if (isDanger) return 'toast isDanger'
		return 'toast'
	}
</script>

<div class="toasts" aria-live="polite">
	{#each ui.toasts as toast (toast.id)}
		<div class={getToastClass(toast.tone)}>{toast.message}</div>
	{/each}
</div>
