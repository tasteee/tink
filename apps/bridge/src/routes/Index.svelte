<script>
	import { you, them, topic } from "../mock.js"
	const protos = [
		{ id: "assist", name: "Assist (lean cut)", desc: "The strong version: a one-sided assist layer inside Slack. See Rahul's real words; tap “what did he mean?” to decipher on demand, and check your own draft before sending. No adoption needed from him.", mini: ["", "p", ""] },
		{ id: "studio", name: "Studio", desc: "The main model: talk to the AI to draft what to send (it proposes send-ready messages), while the chat stays clean. Tap any message for a slide-out analysis.", mini: ["p", "", "s"] },
		{ id: "two", name: "Two-pane, AI-centric", desc: "Your private space with the AI on the left; the live bridged wire the other person sees on the right.", mini: ["p", "", ""] },
		{ id: "three", name: "Three-lane", desc: "Your raw intent, the AI bridge with translation notes in the center, and their raw message.", mini: ["p", "", "s"] },
		{ id: "unified", name: "Unified thread", desc: "One thread. Every message toggles between what was said and what was meant, with a shared glossary.", mini: ["", "", ""] },
	]
</script>

<div class="appShell">
	<header class="appBar">
		<span class="brand"><span class="dot"></span>Bridge</span>
		<div class="grow"></div>
		<z-text size="sm" color="muted">Zest · Atomico web components · mocked</z-text>
	</header>

	<div class="fill" style="overflow-y:auto">
		<div class="picker">
			<z-eyebrow>AI-mediated engineering communication</z-eyebrow>
			<z-text tag="h1" size="7" weight="700" style="display:block;max-width:720px;margin-top:var(--space-md);letter-spacing:-0.02em;line-height:1.05">
				Say it once, in your own words. It lands once, understood.
			</z-text>
			<z-text size="lg" color="muted" style="display:block;max-width:660px;margin-top:var(--space-base);line-height:1.5">
				A live bridge between {you.name} ({you.region}) and {them.name} ({them.region}) on “{topic.title}”.
				You talk to the AI; it conveys your intent without ambiguity or idiom. Three layouts, same conversation.
			</z-text>

			<div class="cardGrid">
				{#each protos as proto}
					<a class="reset" href={"#/" + proto.id}>
						<z-surface level="1" border interactive radius="lg" inset="base" style="display:block;height:100%">
							<div class="stack" style="gap:var(--space-md);height:100%">
								<div class="mini">
									{#each proto.mini as m}<span class={m}></span>{/each}
								</div>
								<z-text size="lg" weight="600">{proto.name}</z-text>
								<z-text size="sm" color="muted" style="flex:1;line-height:1.5">{proto.desc}</z-text>
								<z-row aligns-y="center" gap="2">
									<z-badge tone="primary" kind="soft" size="small" label="Open demo"></z-badge>
									<z-text size="sm" color="muted">→</z-text>
								</z-row>
							</div>
						</z-surface>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
