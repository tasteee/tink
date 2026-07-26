<script>
	import { onMount } from "svelte"
	import AppBar from "../AppBar.svelte"
	import { you, them, turns, glossary, draft, starters } from "../mock.js"

	// z-suggestion-chips takes an Array *property*, not an attribute, so we
	// assign it directly to the element rather than passing a string.
	let chipsEl
	onMount(() => {
		if (chipsEl) chipsEl.suggestions = starters
	})

	// One thread. Each message toggles between what was SAID (raw) and what
	// was MEANT (AI-bridged). Recipients read "meant" by default.
	let modes = {}
	turns.forEach((turn) => { modes[turn.id] = "meant" })

	const setMode = (id, mode) => { modes[id] = mode; modes = modes }

	const conversations = [
		{ id: "rahul", name: them.name, preview: "Shared core we can maintain easily…", time: "2m", unread: 0, active: true, status: "online" },
		{ id: "mei", name: "Mei Tanaka", preview: "Let's revisit the schema tomorrow", time: "1h", unread: 2, active: false, status: "away" },
		{ id: "pipeline", name: "Platform Guild", preview: "Deploy freeze lifts Thursday", time: "3h", unread: 0, active: false, status: "offline" },
	]
</script>

<div class="appShell">
	<AppBar route="unified" />

	<div class="fill">
		<z-chat-shell has-details list-size="300px" details-size="288px" auto-save-id="bridge-unified" style="height:100%">
			<!-- LIST RAIL -->
			<z-conversation-list slot="list">
				{#each conversations as convo}
					<z-conversation-item
						name={convo.name}
						preview={convo.preview}
						timestamp={convo.time}
						avatar-name={convo.name}
						status={convo.status}
						unread={convo.unread || undefined}
						is-active={convo.active || undefined}
					></z-conversation-item>
				{/each}
			</z-conversation-list>

			<!-- THREAD -->
			<div class="pane">
				<z-chat-header name={them.name} subtitle={them.role + " · " + them.region + " · " + them.language} avatar-name={them.name} status="online"></z-chat-header>

				<div class="scroll">
					{#each turns as turn}
						{@const isYou = turn.author === "you"}
						{@const person = isYou ? you : them}
						{@const mode = modes[turn.id]}
						<z-row aligns-y="end" gap="2" style={isYou ? "flex-direction:row-reverse" : ""}>
							<z-avatar name={person.name} initials={person.initials} size="small" tone={isYou ? "primary" : "secondary"}></z-avatar>
							<z-column gap="1" style={"max-width:min(76%,44rem);" + (isYou ? "align-items:flex-end" : "")}>
								<z-row aligns-y="center" gap="2" style={isYou ? "flex-direction:row-reverse" : ""}>
									<z-text size="xs" color="muted">{person.name}</z-text>
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<z-toggle-group is-small is-ghost is-neutral>
										<z-toggle-group-item role="button" tabindex="0" value="said" is-pressed={mode === "said" || undefined} on:click={() => setMode(turn.id, "said")}>said</z-toggle-group-item>
										<z-toggle-group-item role="button" tabindex="0" value="meant" is-pressed={mode === "meant" || undefined} on:click={() => setMode(turn.id, "meant")}>meant</z-toggle-group-item>
									</z-toggle-group>
								</z-row>
								<z-message-bubble side={isYou ? "end" : "start"} tone={isYou && mode === "meant" ? "primary" : undefined}>
									{mode === "said" ? turn.said : turn.meant}
								</z-message-bubble>
								{#if mode === "meant"}
									<z-callout kind="note" style="width:100%">{turn.coach}</z-callout>
								{/if}
							</z-column>
						</z-row>
					{/each}

					<z-suggestion-chips bind:this={chipsEl}></z-suggestion-chips>
				</div>

				<div class="footer">
					<z-composer placeholder={"Message " + them.name + "…"} value={draft.raw}></z-composer>
					<z-text size="xs" color="muted" style="display:block;margin-top:var(--space-xs)">The AI bridges idiom and intent before delivery. Recipients read “meant” by default.</z-text>
				</div>
			</div>

			<!-- DETAILS: shared glossary -->
			<div class="pane" slot="details">
				<div class="paneHead">
					<z-text size="xs" color="muted" weight="600" style="letter-spacing:0.06em;text-transform:uppercase">Shared glossary</z-text>
				</div>
				<div class="scroll">
					{#each glossary as entry}
						<z-surface level="1" border radius="md" inset="md" style="display:block">
							<z-text size="sm" weight="600" style="font-family:var(--font-mono);color:var(--accent)">{entry.term}</z-text>
							<z-text size="xs" color="muted" style="display:block;margin-top:2px">{entry.note}</z-text>
						</z-surface>
					{/each}
					<z-callout kind="tip" heading="Locked terms">Terms the AI pinned so both sides use them identically across the thread.</z-callout>
				</div>
			</div>
		</z-chat-shell>
	</div>
</div>
