import { c, css, event } from 'atomico'

/*
 * z-reactions — the row of emoji-count pills under a message. Data-driven:
 *
 *   el.reactions = [
 *     { emoji: '👍', count: 3, isMine: true },
 *     { emoji: '🎉', count: 1 }
 *   ]
 *
 * Clicking a pill emits `toggle` {emoji, isMine}; the trailing add (＋) button
 * emits `add` (open a z-emoji-picker in response). Hide the add button with
 * `no-add`. A pill the current user reacted with (`isMine`) is highlighted.
 */
type Reaction = { emoji: string; count: number; isMine?: boolean }

const styles = css`
	:host {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		vertical-align: middle;
	}
	:host([is-hidden]) {
		display: none;
	}
	button {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		border: 1px solid var(--border);
		background: color-mix(in oklch, var(--foreground) 5%, transparent);
		border-radius: 999px;
		padding: 0.1rem 0.5rem;
		font-family: inherit;
		font-size: 0.8125rem;
		line-height: 1.4;
		color: var(--foreground);
		cursor: pointer;
		transition:
			background-color 0.12s ease,
			border-color 0.12s ease;
	}
	button:hover {
		border-color: color-mix(in oklch, var(--foreground) 30%, transparent);
	}
	button.is-mine {
		background: color-mix(in oklch, var(--primary) 18%, transparent);
		border-color: color-mix(in oklch, var(--primary) 45%, transparent);
	}
	.emoji {
		font-size: 0.9375rem;
	}
	.count {
		font-variant-numeric: tabular-nums;
		color: var(--muted-foreground);
	}
	button.is-mine .count {
		color: var(--foreground);
	}
	.add {
		padding: 0.1rem 0.45rem;
		color: var(--muted-foreground);
	}
	.add svg {
		width: 0.9rem;
		height: 0.9rem;
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
	}
`

export const ZReactions = c(
	(props) => {
		const reactions: Reaction[] = Array.isArray(props.reactions) ? (props.reactions as Reaction[]) : []

		return (
			<host shadowDom>
				{reactions.map((r) => (
					<button
						key={r.emoji}
						type="button"
						class={r.isMine ? 'is-mine' : ''}
						aria-pressed={r.isMine ? 'true' : 'false'}
						onclick={() => props.toggle({ emoji: r.emoji, isMine: Boolean(r.isMine) })}
					>
						<span class="emoji">{r.emoji}</span>
						<span class="count">{r.count}</span>
					</button>
				))}
				{!props.noAdd && (
					<button class="add" type="button" aria-label="Add reaction" onclick={() => props.add()}>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M12 8v8M8 12h8" />
							<circle cx="12" cy="12" r="9" />
						</svg>
					</button>
				)}
			</host>
		)
	},
	{
		props: {
			reactions: { type: Array },
			noAdd: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			toggle: event<{ emoji: string; isMine: boolean }>({ bubbles: true, composed: true }),
			add: event<void>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-reactions', ZReactions)
