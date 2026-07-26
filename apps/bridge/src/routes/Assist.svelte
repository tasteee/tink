<script>
	import AppBar from "../AppBar.svelte"
	import { you, them, turns, analysis, draft } from "../mock.js"

	// One-sided assist, embedded in a Slack-style channel. Incoming messages
	// show Rahul's ACTUAL words (his side runs nothing). You decipher on
	// demand, and can sanity-check your own draft before sending.

	// Build the channel from the raw messages (said), not the clarified ones.
	const messages = turns.map((turn) => {
		const isYou = turn.author === "you"
		const person = isYou ? you : them
		return {
			id: turn.id,
			isYou,
			name: person.name,
			initials: person.initials,
			text: turn.said,
			canDecipher: analysis[turn.id] !== undefined,
		}
	})

	const times = { 1: "10:01", 2: "10:02", 3: "10:04", 4: "10:05" }

	const channels = [
		{ id: "deploy", name: "deploy-pipeline", active: true },
		{ id: "platform", name: "platform-eng", active: false },
		{ id: "incidents", name: "incidents", active: false },
		{ id: "rahul", name: them.name, dm: true, active: false },
	]

	let openAssist = null
	let checkOpen = false

	const toggleAssist = (id) => { openAssist = openAssist === id ? null : id }
	const toggleCheck = () => { checkOpen = !checkOpen }
	const dismissCheck = () => { checkOpen = false }
</script>

<div class="appShell">
	<AppBar route="assist" />

	<div class="fill rowFill">
		<!-- Slack-style rail -->
		<aside class="slackRail">
			<div class="ws">
				<span class="dot"></span>
				Acme Platform
			</div>
			<div class="section">
				<z-text size="xs" color="muted" weight="600" style="letter-spacing:0.04em;text-transform:uppercase">Channels</z-text>
			</div>
			{#each channels as channel}
				<div class="channelRow" class:active={channel.active}>
					{#if channel.dm}
						<z-status-dot status="online" size="small"></z-status-dot>
					{:else}
						<span class="hash">#</span>
					{/if}
					{channel.name}
				</div>
			{/each}
		</aside>

		<!-- Channel thread -->
		<div class="pane">
			<div class="chHead">
				<z-text size="md" weight="600"># deploy-pipeline</z-text>
				<z-separator is-vertical></z-separator>
				<z-text size="sm" color="muted">CLI vs UI · alignment</z-text>
				<div class="grow"></div>
				<z-avatar-stack size="small" max="3" total="6">
					<z-avatar name={you.name} initials={you.initials} tone="primary" size="small"></z-avatar>
					<z-avatar name={them.name} initials={them.initials} tone="secondary" size="small"></z-avatar>
					<z-avatar name="Mei Tanaka" initials="MT" size="small"></z-avatar>
				</z-avatar-stack>
			</div>

			<div class="scroll" style="gap:2px">
				{#each messages as message}
					<div class="msgRow">
						<z-avatar name={message.name} initials={message.initials} size="small" tone={message.isYou ? "primary" : "secondary"}></z-avatar>
						<div class="msgBody">
							<div class="msgHead">
								<z-text size="sm" weight="600">{message.name}</z-text>
								<z-text size="xs" color="muted">{times[message.id]}</z-text>
								{#if !message.isYou}
									<z-badge tone="neutral" kind="outline" size="small" label={them.region.split(",")[1] ? them.region.split(",")[1].trim() : "IN"}></z-badge>
								{/if}
							</div>
							<z-text size="sm">{message.text}</z-text>

							{#if message.canDecipher}
								<div class="msgAction" class:stuck={openAssist === message.id}>
									<z-badge tone="primary" kind="soft" size="small" is-selectable is-selected={openAssist === message.id || undefined} label="✨ what did he mean?" on:click={() => toggleAssist(message.id)}></z-badge>
								</div>
							{/if}

							{#if openAssist === message.id}
								{@const info = analysis[message.id]}
								<div class="assistBlock">
									<z-surface level="1" tone="primary" variant="soft" radius="md" inset="base" style="display:block">
										<z-row aligns-y="center" gap="2" style="margin-bottom:var(--space-sm)">
											<z-badge tone="primary" kind="soft" size="small" is-dot label="what he means"></z-badge>
											<div class="grow"></div>
											<z-button size="small" kind="ghost" is-icon on:click={() => toggleAssist(message.id)}>✕</z-button>
										</z-row>
										<z-text size="sm">{info.meaning}</z-text>
										<z-callout kind="tip" heading="Notes" style="margin-top:var(--space-sm)">{info.notes}</z-callout>
										<z-row gap="2" wrap style="margin-top:var(--space-sm)">
											{#each info.tags as tag}
												<z-badge tone="neutral" kind="outline" size="small" label={tag}></z-badge>
											{/each}
										</z-row>
									</z-surface>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<!-- Composer with on-demand pre-send check -->
			<div class="footer">
				<div class="composerWrap">
					{#if checkOpen}
						<div class="checkPop">
							<z-surface level="2" tone="primary" variant="soft" border radius="lg" inset="base" style="display:block">
								<z-row aligns-y="center" gap="2" style="margin-bottom:var(--space-sm)">
									<z-badge tone="primary" kind="soft" size="small" is-dot label="clearer version"></z-badge>
									<div class="grow"></div>
									<z-button size="small" kind="ghost" is-icon on:click={dismissCheck}>✕</z-button>
								</z-row>
								<z-text size="sm">{draft.bridged}</z-text>
								<div class="stack" style="gap:2px;margin-top:var(--space-sm)">
									{#each draft.notes as note}
										<z-row aligns-y="start" gap="2">
											<z-badge tone="neutral" kind="outline" size="small" label="edit"></z-badge>
											<z-text size="xs" color="muted">{note}</z-text>
										</z-row>
									{/each}
								</div>
								<z-row gap="2" style="margin-top:var(--space-base)">
									<z-button size="small" kind="solid" tone="primary" on:click={dismissCheck}>Use this</z-button>
									<z-button size="small" kind="ghost" on:click={dismissCheck}>Keep mine</z-button>
								</z-row>
							</z-surface>
						</div>
					{/if}

					<z-composer placeholder="Message #deploy-pipeline" value={draft.raw}>
						<z-button slot="leading" size="small" kind={checkOpen ? "soft" : "ghost"} tone="primary" on:click={toggleCheck}>✨ Check</z-button>
					</z-composer>
				</div>
				<z-text size="xs" color="muted" style="display:block;margin-top:var(--space-xs)">Only you use this. Nothing changes for Rahul — you decipher his messages on demand and check your own before they go.</z-text>
			</div>
		</div>
	</div>
</div>
