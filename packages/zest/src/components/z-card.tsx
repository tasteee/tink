import { c, css } from 'atomico'
import { coerceSize, sizeProp } from '../shared/layout-schema'

const styles = css`
	:host {
		display: block;
		box-sizing: border-box;
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		transition: border-color 0.05s linear;
		border: 1px solid var(--border);
		color: var(--foreground);
	}

	:host([is-flex]) {
		display: flex;
		flex-direction: row;
		gap: var(--z-card-gap);
	}

	:host([is-row]) {
		flex-direction: row;
	}

	:host([is-column]) {
		flex-direction: column;
	}

	:host([is-reactive]:hover),
	:host([is-reactive]:focus-within) {
		border-color: color-mix(in oklch, var(--foreground) 50%, transparent);
	}

	:host([is-hidden]) {
		display: none;
	}
`

export const ZCard = c(
	(props) => (
		<host shadowDom style={{ '--z-card-gap': coerceSize((props as any).gap) || '' }}>
			<slot />
		</host>
	),
	{
		props: {
			isHidden: { type: Boolean, reflect: true },
			isFlex: { type: Boolean, reflect: true },
			isRow: { type: Boolean, reflect: true },
			isColumn: { type: Boolean, reflect: true },
			isReactive: { type: Boolean, reflect: true },
			gap: sizeProp
		},
		styles
	}
)

customElements.define('z-card', ZCard)
