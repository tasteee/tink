import { c, css, useState } from 'atomico'

/*
 * z-empty-state — the centered placeholder shown when a list, search, or page
 * has nothing to display. An optional [slot="icon"] sits above a `heading` and
 * `description`, with the default slot reserved for actions (buttons). Borders
 * only; the icon carries a soft tonal tint. Keep the copy short and the action
 * singular.
 */
const styles = css`
	:host {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.75rem;
		padding: var(--space-2xl) var(--space-lg);
		--accent: var(--purple);
	}

	:host([tone='secondary']) {
		--accent: var(--pink);
	}

	:host([is-bordered]) {
		border: 1px dashed var(--border);
		border-radius: var(--radius-lg);
	}

	:host([is-hidden]) {
		display: none;
	}

	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		margin-bottom: 0.25rem;
		border-radius: var(--radius-lg);
		color: var(--accent);
		background: color-mix(in oklch, var(--accent) 12%, transparent);
	}

	.icon.is-empty {
		display: none;
	}

	::slotted([slot='icon']) {
		width: 1.5rem;
		height: 1.5rem;
	}

	.heading {
		margin: 0;
		font-size: var(--font-size-h4);
		font-weight: 600;
		color: var(--foreground);
		line-height: var(--line-height-h4);
	}

	.description {
		margin: 0;
		max-width: 42ch;
		color: var(--muted-foreground);
		font-size: var(--font-size-small);
		line-height: var(--line-height-body);
	}

	.actions {
		display: flex;
		gap: 0.625rem;
		margin-top: 1rem;
	}

	.actions.is-empty {
		display: none;
	}
`

const slotHas = (e: Event) => (e.target as HTMLSlotElement).assignedNodes().length > 0

export const ZEmptyState = c(
	(props) => {
		const [hasIcon, setHasIcon] = useState(false)
		const [hasActions, setHasActions] = useState(false)

		return (
			<host shadowDom>
				<span class={hasIcon ? 'icon' : 'icon is-empty'}>
					<slot name="icon" onslotchange={(e: Event) => setHasIcon(slotHas(e))} />
				</span>
				{props.heading && <p class="heading">{props.heading}</p>}
				{props.description && <p class="description">{props.description}</p>}
				<div class={hasActions ? 'actions' : 'actions is-empty'}>
					<slot onslotchange={(e: Event) => setHasActions(slotHas(e))} />
				</div>
			</host>
		)
	},
	{
		props: {
			heading: String,
			description: String,
			tone: { type: String, reflect: true },
			isBordered: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-empty-state', ZEmptyState)
