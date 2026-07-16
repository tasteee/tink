import { c, css, event } from 'atomico'

/*
 * z-message-actions — the floating action bar revealed on message hover: a few
 * quick-reaction emojis, then reply / forward / more. Mirrors z-toolbar
 * semantics (role="toolbar") in a self-contained strip the consumer positions
 * over a bubble.
 *
 *   <z-message-actions></z-message-actions>
 *
 * Events: `react` {emoji} (quick emoji tapped) · `addreaction` (open a
 * z-emoji-picker) · `reply` · `forward` · `more`. Customize the quick set via
 * the `quick-reactions` property (array of emoji strings); hide actions with
 * `no-reply` / `no-forward` / `no-more`.
 */
const DEFAULT_QUICK = ['👍', '❤️', '😂', '🎉', '😮', '😢']

const styles = css`
	:host {
		display: inline-flex;
		align-items: center;
		gap: 0.125rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 0px 0.25rem 0.125rem;
		box-shadow: 0 2px 8px color-mix(in oklch, var(--foreground) 12%, transparent);
	}
	:host([is-hidden]) {
		display: none;
	}
	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border: none;
		background: transparent;
		border-radius: 999px;
		cursor: pointer;
		padding: 0;
		color: var(--muted-foreground);
		font-size: 1rem;
		transition:
			background-color 0.1s ease,
			transform 0.06s ease;
	}
	button:hover {
		background: color-mix(in oklch, var(--foreground) 10%, transparent);
		color: var(--foreground);
	}
	button.quick:hover {
		transform: scale(1.2);
	}
	.divider {
		width: 1px;
		height: 1.1rem;
		background: var(--border);
		margin: 0 0.125rem;
	}
	svg {
		width: 1rem;
		height: 1rem;
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.dots circle {
		fill: currentColor;
		stroke: none;
	}
`

export const ZMessageActions = c(
	(props) => {
		const quick: string[] = Array.isArray(props.quickReactions) ? (props.quickReactions as string[]) : DEFAULT_QUICK

		return (
			<host shadowDom role="toolbar" aria-label="Message actions">
				{quick.map((emoji) => (
					<button
						key={emoji}
						type="button"
						class="quick"
						aria-label={`React ${emoji}`}
						onclick={() => props.react({ emoji })}
					>
						{emoji}
					</button>
				))}
				<button type="button" aria-label="More reactions" onclick={() => props.addreaction()}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<circle cx="12" cy="12" r="9" />
						<path d="M8.5 14a4 4 0 0 0 7 0" />
						<path d="M9 9h.01M15 9h.01" />
					</svg>
				</button>

				<span class="divider" aria-hidden="true"></span>

				{!props.noReply && (
					<button type="button" aria-label="Reply" onclick={() => props.reply()}>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M9 14L4 9l5-5" />
							<path d="M4 9h11a5 5 0 0 1 5 5v3" />
						</svg>
					</button>
				)}
				{!props.noForward && (
					<button type="button" aria-label="Forward" onclick={() => props.forward()}>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M15 14l5-5-5-5" />
							<path d="M20 9H9a5 5 0 0 0-5 5v3" />
						</svg>
					</button>
				)}
				{!props.noMore && (
					<button type="button" aria-label="More" onclick={() => props.more()}>
						<svg class="dots" viewBox="0 0 24 24" aria-hidden="true">
							<circle cx="5" cy="12" r="1.6" />
							<circle cx="12" cy="12" r="1.6" />
							<circle cx="19" cy="12" r="1.6" />
						</svg>
					</button>
				)}
			</host>
		)
	},
	{
		props: {
			quickReactions: { type: Array },
			noReply: { type: Boolean, reflect: true },
			noForward: { type: Boolean, reflect: true },
			noMore: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			react: event<{ emoji: string }>({ bubbles: true, composed: true }),
			addreaction: event<void>({ bubbles: true, composed: true }),
			reply: event<void>({ bubbles: true, composed: true }),
			forward: event<void>({ bubbles: true, composed: true }),
			more: event<void>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-message-actions', ZMessageActions)
