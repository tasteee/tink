<script>
	import Index from "./routes/Index.svelte"
	import Assist from "./routes/Assist.svelte"
	import Studio from "./routes/Studio.svelte"
	import TwoPane from "./routes/TwoPane.svelte"
	import ThreeLane from "./routes/ThreeLane.svelte"
	import Unified from "./routes/Unified.svelte"

	let route = "index"

	const parseHash = () => {
		const raw = window.location.hash.replace(/^#\/?/, "")
		if (raw === "assist") return "assist"
		if (raw === "studio") return "studio"
		if (raw === "two") return "two"
		if (raw === "three") return "three"
		if (raw === "unified") return "unified"
		return "index"
	}

	const syncRoute = () => { route = parseHash() }

	syncRoute()
	window.addEventListener("hashchange", syncRoute)
</script>

{#if route === "assist"}
	<Assist />
{:else if route === "studio"}
	<Studio />
{:else if route === "two"}
	<TwoPane />
{:else if route === "three"}
	<ThreeLane />
{:else if route === "unified"}
	<Unified />
{:else}
	<Index />
{/if}
