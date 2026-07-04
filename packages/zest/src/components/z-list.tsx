import { c, css } from 'atomico'

/*
 * z-list — a vertical stack of rows on a card surface, hairline-divided. Slot in
 * z-list-row items (and optional header text); an optional `label` renders a
 * mono uppercase section caption at the top. Rounds and clips its rows so the
 * first/last sit flush with the card corners. Pair with z-list-row for the
 * per-row grid layout.
 */
const styles = css`
	:host {
		display: block;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	:host([is-plain]) {
		background: transparent;
		border: none;
		border-radius: 0;
	}

	:host([is-hidden]) {
		display: none;
	}

	.label {
		display: block;
		padding: 0.875rem 1rem 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	/* Hairline dividers between rows. ::slotted() only accepts a compound
	   selector (no sibling combinators), so draw a top border on every row but
	   the first. The label lives in the shadow DOM, so :first-child here is the
	   first slotted light-DOM row. */
	::slotted(z-list-row:not(:first-child)) {
		border-top: 1px solid var(--border);
	}
`

export const ZList = c(
	(props) => (
		<host shadowDom>
			{props.label && <span class="label">{props.label}</span>}
			<slot />
		</host>
	),
	{
		props: {
			label: String,
			isPlain: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-list', ZList)
