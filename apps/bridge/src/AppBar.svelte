<script>
	import { topic } from "./mock.js"
	export let route = "two"
	const tabs = [
		{ id: "assist", label: "Assist" },
		{ id: "studio", label: "Studio" },
		{ id: "two", label: "Two-pane" },
		{ id: "three", label: "Three-lane" },
		{ id: "unified", label: "Unified" },
	]
</script>

<header class="appBar">
	<a class="brand reset" href="#/">
		<span class="dot"></span>
		Bridge
	</a>
	<z-separator is-vertical></z-separator>
	<div class="stack" style="line-height:1.2">
		<z-text size="sm" weight="600">{topic.title}</z-text>
		<z-text size="xs" color="muted">{topic.stakes}</z-text>
	</div>
	<div class="grow"></div>
	<nav class="switch">
		{#each tabs as tab}
			<a href={"#/" + tab.id} class:on={route === tab.id}>{tab.label}</a>
		{/each}
	</nav>
</header>
