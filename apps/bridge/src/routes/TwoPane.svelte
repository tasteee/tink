<script>
	import AppBar from "../AppBar.svelte"
	import { you, them, turns, draft } from "../mock.js"
	// Left = your private space with the AI (your words + coaching).
	// Right = the live wire: what actually crosses the language boundary.
</script>

<div class="appShell">
	<AppBar route="two" />

	<div class="fill">
		<z-resizable-panels direction="row" auto-save-id="bridge-two" style="height:100%">
			<!-- LEFT: you + the AI -->
			<z-panel default-size="52%" min-size="34%">
				<div class="pane">
					<div class="paneHead">
						<z-avatar name={you.name} initials={you.initials} size="small" tone="primary"></z-avatar>
						<div class="stack" style="line-height:1.2">
							<z-text size="sm" weight="600">You &amp; the AI</z-text>
							<z-text size="xs" color="muted">your words · private coaching</z-text>
						</div>
						<div class="grow"></div>
						<z-badge tone="neutral" kind="outline" size="small" label="private"></z-badge>
					</div>

					<div class="scroll">
						{#each turns as turn}
							{#if turn.author === "you"}
								<z-message-group side="end" name={you.name} avatar-initials={you.initials}>
									<z-message-bubble>{turn.said}</z-message-bubble>
								</z-message-group>
								<z-callout kind="note" heading="Sending as">{turn.meant}</z-callout>
							{:else}
								<z-callout kind="tip" heading={them.name + " means"}>{turn.coach}</z-callout>
								<z-message-group side="start" name={them.name} avatar-initials={them.initials}>
									<z-message-bubble>{turn.meant}</z-message-bubble>
								</z-message-group>
							{/if}
						{/each}
					</div>

					<div class="footer">
						<z-composer placeholder="Talk to the AI in your own words…" value={draft.raw}></z-composer>
					</div>
				</div>
			</z-panel>

			<z-panel-handle></z-panel-handle>

			<!-- RIGHT: the live wire -->
			<z-panel min-size="34%">
				<div class="pane">
					<div class="paneHead">
						<z-avatar name={them.name} initials={them.initials} size="small" status="online" tone="secondary"></z-avatar>
						<div class="stack" style="line-height:1.2">
							<z-text size="sm" weight="600">{them.name}</z-text>
							<z-text size="xs" color="muted">{them.role} · {them.region}</z-text>
						</div>
						<div class="grow"></div>
						<z-status-dot status="online" pulse label="live"></z-status-dot>
					</div>

					<div class="scroll">
						{#each turns as turn}
							{#if turn.author === "you"}
								<z-message-group side="end" name={you.name} avatar-initials={you.initials}>
									<z-message-bubble tone="primary">{turn.meant}</z-message-bubble>
								</z-message-group>
							{:else}
								<z-message-group side="start" name={them.name} avatar-initials={them.initials}>
									<z-message-bubble>{turn.said}</z-message-bubble>
								</z-message-group>
							{/if}
						{/each}
					</div>

					<div class="footer">
						<z-surface level="1" tone="primary" variant="soft" radius="md" inset="md" style="display:block">
							<z-row aligns-y="center" gap="2" style="margin-bottom:var(--space-xs)">
								<z-badge tone="primary" kind="soft" size="small" is-dot label="outgoing · idiom-free"></z-badge>
							</z-row>
							<z-text size="sm">{draft.bridged}</z-text>
						</z-surface>
					</div>
				</div>
			</z-panel>
		</z-resizable-panels>
	</div>
</div>
