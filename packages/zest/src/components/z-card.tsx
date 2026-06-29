import { c, css } from 'atomico'

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

	:host([does-light-up-on-hover]:hover),
	:host([does-light-up-on-hover]:focus-within) {
		border-color: color-mix(in oklch, var(--foreground) 50%, transparent);
	}

	:host([is-hidden]) {
		display: none;
	}
`

export const ZCard = c(
	(props) => (
		<host shadowDom style={{ '--z-card-gap': props.gap || '' }}>
			<slot />
		</host>
	),
	{
		props: {
			isHidden: { type: Boolean, reflect: true },
			isFlex: { type: Boolean, reflect: true },
			isRow: { type: Boolean, reflect: true },
			isColumn: { type: Boolean, reflect: true },
			doesLightUpOnHover: { type: Boolean, reflect: true },
			gap: String
		},
		styles
	}
)

customElements.define('z-card', ZCard)
