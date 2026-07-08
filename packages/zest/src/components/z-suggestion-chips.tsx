import { c, css, event } from 'atomico'

/*
 * z-suggestion-chips — a wrapping row of tappable prompt suggestions: starter
 * prompts on an empty thread, or follow-up questions after an answer. Emits
 * `select` {value, label} when one is tapped. Data-driven:
 *
 *   el.suggestions = ['Summarize this', 'Explain like I'm 5', { label: 'Translate', value: 'translate' }]
 */
type Suggestion = string | { label: string; value?: string }

const styles = css`
	:host {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	:host([is-hidden]) {
		display: none;
	}
	button {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border: 1px solid var(--border);
		background: color-mix(in oklch, var(--foreground) 4%, transparent);
		border-radius: 999px;
		padding: 0.35rem 0.75rem;
		font-family: inherit;
		font-size: 0.8125rem;
		color: var(--foreground);
		cursor: pointer;
		text-align: left;
		transition:
			background-color 0.12s ease,
			border-color 0.12s ease;
	}
	button:hover {
		background: color-mix(in oklch, var(--primary) 12%, transparent);
		border-color: color-mix(in oklch, var(--primary) 40%, transparent);
	}
	.arrow {
		width: 0.8rem;
		height: 0.8rem;
		stroke: var(--muted-foreground);
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
`

export const ZSuggestionChips = c(
	(props) => {
		const items: Suggestion[] = Array.isArray(props.suggestions) ? (props.suggestions as Suggestion[]) : []
		const norm = (s: Suggestion) => (typeof s === 'string' ? { label: s, value: s } : { label: s.label, value: s.value ?? s.label })

		return (
			<host shadowDom>
				{items.map((s, i) => {
					const { label, value } = norm(s)
					return (
						<button key={i} type="button" onclick={() => props.select({ value, label })}>
							{label}
							{props.showArrow && (
								<svg class="arrow" viewBox="0 0 24 24" aria-hidden="true">
									<path d="M5 12h14M13 6l6 6-6 6" />
								</svg>
							)}
						</button>
					)
				})}
				<slot />
			</host>
		)
	},
	{
		props: {
			suggestions: { type: Array },
			showArrow: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			select: event<{ value: string; label: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-suggestion-chips', ZSuggestionChips)
