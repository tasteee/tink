import { c, css, event, useProp } from 'atomico'

/*
 * z-collapsible — a single disclosure section. A trigger row (the `label` prop,
 * or a slotted [slot="trigger"] for richer content) toggles a content region
 * (the default slot). Borders only, accent chevron, no shadows. Fires a
 * `toggle` event carrying { value, open } so a parent <z-accordion> can
 * coordinate single/multiple open behavior.
 */
const styles = css`
	:host {
		display: block;
		--accent: var(--primary);
	}

	:host([tone='primary']) {
		--accent: var(--purple);
	}

	:host([tone='secondary']) {
		--accent: var(--pink);
	}

	:host([is-hidden]) {
		display: none;
	}

	.trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		width: 100%;
		box-sizing: border-box;
		background: transparent;
		border: 0;
		padding: 0.875rem 0;
		font-family: inherit;
		font-size: var(--font-size-body);
		font-weight: 500;
		color: var(--foreground);
		text-align: left;
		cursor: pointer;
		transition: color 0.12s ease;
	}

	.trigger:hover {
		color: var(--accent);
	}

	.trigger:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.trigger:disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.chevron {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--muted-foreground);
		transition:
			transform 0.18s ease,
			color 0.12s ease;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.trigger:hover .chevron,
	:host([is-open]) .chevron {
		color: var(--accent);
	}

	:host([is-open]) .chevron {
		transform: rotate(180deg);
	}

	.content {
		display: none;
		padding: 0 0 1rem;
		color: var(--muted-foreground);
		font-size: var(--font-size-small);
		line-height: var(--line-height-body);
	}

	:host([is-open]) .content {
		display: block;
	}
`

export const ZCollapsible = c(
	(props) => {
		const [isOpen, setIsOpen] = useProp<boolean>('isOpen')

		const toggle = () => {
			if (props.isDisabled) return
			const next = !isOpen
			setIsOpen(next)
			props.toggle({ value: props.value || '', open: next })
		}

		return (
			<host shadowDom>
				<button
					type="button"
					class="trigger"
					disabled={props.isDisabled}
					aria-expanded={isOpen ? 'true' : 'false'}
					onclick={toggle}
				>
					<slot name="trigger">{props.label}</slot>
					<svg class="chevron" viewBox="0 0 24 24">
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>
				<div class="content" role="region">
					<slot />
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true },
			label: String,
			tone: { type: String, reflect: true },
			isOpen: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			toggle: event<{ value: string; open: boolean }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-collapsible', ZCollapsible)
