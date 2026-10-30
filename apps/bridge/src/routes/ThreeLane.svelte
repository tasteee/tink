<script>
	import AppBar from "../AppBar.svelte"
	import { you, them, turns, draft } from "../mock.js"
	// Center lane is the AI bridge (clarified text + translation notes).
	// Left = your raw intent. Right = their raw message.
</script>

<div class="appShell">
	<AppBar route="three" />

	<div class="fill">
		<z-resizable-panels direction="row" auto-save-id="bridge-three" style="height:100%">
			<!-- LEFT: your raw intent -->
			<z-panel default-size="27%" min-size="18%">
				<div class="pane lane">
					<div class="paneHead">
						<z-avatar name={you.name} initials={you.initials} size="small" tone="primary"></z-avatar>
						<z-text size="xs" color="muted" weight="600" style="letter-spacing:0.06em;text-transform:uppercase">Your intent · raw</z-text>
					</div>
					<div class="scroll">
						{#each turns as turn}
							{#if turn.author === "you"}
								<z-surface level="1" variant="outlined" radius="md" inset="md" style="display:block">
									<z-text size="sm" color="muted">{turn.said}</z-text>
								</z-surface>
							{:else}
								<div style="height:2px"></div>
							{/if}
						{/each}
					</div>
				</div>
			</z-panel>

			<z-panel-handle></z-panel-handle>

			<!-- CENTER: the AI bridge -->
			<z-panel min-size="34%">
				<div class="pane laneMid">
					<div class="paneHead">
						<z-badge tone="primary" kind="soft" size="small" is-dot label="AI bridge · unambiguous"></z-badge>
						<div class="grow"></div>
						<z-badge tone="neutral" kind="outline" size="small" label="auto"></z-badge>
					</div>
					<div class="scroll">
						{#each turns as turn}
							<z-message-group side={turn.author === "you" ? "end" : "start"} name={turn.author === "you" ? you.name : them.name} avatar-initials={turn.author === "you" ? you.initials : them.initials}>
								<z-message-bubble tone={turn.author === "you" ? "primary" : undefined}>{turn.meant}</z-message-bubble>
							</z-message-group>
							<z-callout kind="note">{turn.coach}</z-callout>
						{/each}
					</div>
					<div class="footer">
						<z-surface level="2" radius="md" inset="md" border style="display:block;margin-bottom:var(--space-sm)">
							<z-row aligns-y="center" gap="2" style="margin-bottom:var(--space-xs)">
								<z-badge tone="primary" kind="soft" size="small" label="bridged from your draft"></z-badge>
							</z-row>
							<z-text size="sm">{draft.bridged}</z-text>
							<div class="stack" style="gap:2px;margin-top:var(--space-sm)">
								{#each draft.notes as note}
									<z-row aligns-y="start" gap="2">
										<z-badge tone="neutral" kind="outline" size="small" label="note"></z-badge>
										<z-text size="xs" color="muted">{note}</z-text>
									</z-row>
								{/each}
							</div>
						</z-surface>
						<z-composer placeholder="Type in your own words, the bridge rewrites it live…" value={draft.raw}></z-composer>
					</div>
				</div>
			</z-panel>

			<z-panel-handle></z-panel-handle>

			<!-- RIGHT: their raw message -->
			<z-panel default-size="27%" min-size="18%">
				<div class="pane lane">
					<div class="paneHead">
						<z-avatar name={them.name} initials={them.initials} size="small" status="online" tone="secondary"></z-avatar>
						<z-text size="xs" color="muted" weight="600" style="letter-spacing:0.06em;text-transform:uppercase">{them.name} · raw</z-text>
					</div>
					<div class="scroll">
						{#each turns as turn}
							{#if turn.author === "them"}
								<z-surface level="1" variant="outlined" radius="md" inset="md" style="display:block">
									<z-text size="sm" color="muted">{turn.said}</z-text>
								</z-surface>
							{:else}
								<div style="height:2px"></div>
							{/if}
						{/each}
					</div>
				</div>
			</z-panel>
		</z-resizable-panels>
	</div>
</div>
