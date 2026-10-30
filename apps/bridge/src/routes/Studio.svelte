<script>
	import AppBar from "../AppBar.svelte"
	import { you, them, turns, aiThread, analysis, draft } from "../mock.js"

	// The main area is you working with the AI (left). The chat (middle) is
	// always clean, every message arrives already clarified. Selecting a
	// message slides out an analysis panel (right).
	let selectedId = null
	let sent = false
	let chat = [...turns]

	const proposalMessage = aiThread.find((message) => message.proposal)

	const selectMessage = (id) => {
		const hasAnalysis = analysis[id] !== undefined
		if (!hasAnalysis) return
		selectedId = selectedId === id ? null : id
	}

	const closePanel = () => { selectedId = null }

	const acceptProposal = () => {
		if (sent) return
		sent = true
		const outgoing = { id: 900, author: "you", said: proposalMessage.proposal, meant: proposalMessage.proposal, coach: "", clarity: "clear" }
		chat = [...chat, outgoing]
	}

	$: selected = selectedId === null ? null : analysis[selectedId]
</script>

<div class="appShell">
	<AppBar route="studio" />

	<div class="fill rowFill">
		<div style="flex:1;min-width:0;display:flex">
			<z-resizable-panels direction="row" style="height:100%;flex:1">
				<!-- LEFT: you & the AI (the main workspace) -->
				<z-panel default-size="46%" min-size="32%">
					<div class="pane">
						<div class="paneHead">
							<z-avatar name="AI" initials="AI" size="small"></z-avatar>
							<div class="stack" style="line-height:1.2">
								<z-text size="sm" weight="600">You &amp; the AI</z-text>
								<z-text size="xs" color="muted">draft what to say · understand what they meant</z-text>
							</div>
							<div class="grow"></div>
							<z-badge tone="neutral" kind="outline" size="small" label="private"></z-badge>
						</div>

						<div class="scroll">
							{#each aiThread as message}
								{#if message.author === "you"}
									<z-message-group side="end" name={you.name} avatar-initials={you.initials}>
										<z-message-bubble tone="primary">{message.text}</z-message-bubble>
									</z-message-group>
								{:else}
									<z-message-group side="start" name="AI" avatar-initials="AI">
										<z-message-bubble>{message.text}</z-message-bubble>
									</z-message-group>
									{#if message.proposal}
										<z-surface level="2" border radius="lg" inset="base" style="display:block;margin-left:2.25rem">
											<z-row aligns-y="center" gap="2" style="margin-bottom:var(--space-sm)">
												<z-badge tone="primary" kind="soft" size="small" is-dot label={sent ? "sent to " + them.name : "ready to send to " + them.name}></z-badge>
											</z-row>
											<z-text size="base">{message.proposal}</z-text>
											<z-row gap="2" style="margin-top:var(--space-base)">
												{#if sent}
													<z-button size="small" kind="soft" tone="success" is-disabled>✓ Sent</z-button>
												{:else}
													<z-button size="small" kind="solid" tone="primary" on:click={acceptProposal}>Send it</z-button>
													<z-button size="small" kind="ghost">Tweak</z-button>
												{/if}
											</z-row>
										</z-surface>
									{/if}
								{/if}
							{/each}
						</div>

						<div class="footer">
							<z-composer placeholder="Tell the AI what you want to convey…"></z-composer>
						</div>
					</div>
				</z-panel>

				<z-panel-handle></z-panel-handle>

				<!-- MIDDLE: the clean chat -->
				<z-panel min-size="30%">
					<div class="pane">
						<div class="paneHead">
							<z-avatar name={them.name} initials={them.initials} size="small" status="online" tone="secondary"></z-avatar>
							<div class="stack" style="line-height:1.2">
								<z-text size="sm" weight="600">{them.name}</z-text>
								<z-text size="xs" color="muted">every message arrives already clarified</z-text>
							</div>
							<div class="grow"></div>
							<z-status-dot status="online" pulse label="live"></z-status-dot>
						</div>

						<div class="scroll">
							{#each chat as turn}
								{@const isYou = turn.author === "you"}
								{@const canAnalyze = analysis[turn.id] !== undefined}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<!-- svelte-ignore a11y_click_events_have_key_events -->
								<div class="msgClick" class:sel={selectedId === turn.id} on:click={() => selectMessage(turn.id)}>
									<z-message-group side={isYou ? "end" : "start"} name={isYou ? you.name : them.name} avatar-initials={isYou ? you.initials : them.initials}>
										<z-message-bubble tone={isYou ? "primary" : undefined}>{turn.meant}</z-message-bubble>
									</z-message-group>
									{#if canAnalyze}
										<div class="analyzeRow">
											<z-badge tone="neutral" kind="soft" size="small" is-selectable label="Analyze ↗"></z-badge>
										</div>
									{/if}
								</div>
							{/each}
						</div>

						<div class="footer">
							<z-text size="xs" color="muted">Replies you send from the left land here already polished. Incoming messages are pre-processed, tap one to go deeper.</z-text>
						</div>
					</div>
				</z-panel>
			</z-resizable-panels>
		</div>

		<!-- RIGHT: slide-out analysis -->
		{#if selected}
			<aside class="analysisPane">
				<div class="paneHead">
					<z-badge tone="primary" kind="soft" size="small" is-dot label="Analysis"></z-badge>
					<div class="grow"></div>
					<z-button size="small" kind="ghost" is-icon on:click={closePanel}>✕</z-button>
				</div>
				<div class="scroll">
					<div class="stack" style="gap:6px">
						<z-text size="xs" color="muted" weight="600" style="letter-spacing:0.06em;text-transform:uppercase">Original message</z-text>
						<z-surface level="1" variant="outlined" radius="md" inset="md" style="display:block">
							<z-text size="sm" color="muted">{selected.original}</z-text>
						</z-surface>
					</div>
					<div class="stack" style="gap:6px">
						<z-text size="xs" color="muted" weight="600" style="letter-spacing:0.06em;text-transform:uppercase">What it means</z-text>
						<z-text size="sm">{selected.meaning}</z-text>
					</div>
					<z-callout kind="tip" heading="Cultural &amp; language notes">{selected.notes}</z-callout>
					<z-row gap="2" wrap>
						{#each selected.tags as tag}
							<z-badge tone="neutral" kind="outline" size="small" label={tag}></z-badge>
						{/each}
					</z-row>
				</div>
			</aside>
		{/if}
	</div>
</div>
