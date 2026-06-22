import { c, css } from 'atomico'

const styles = css`
	:host {
		display: block;
		flex-shrink: 0;
		background: var(--border);
		height: 1px;
		width: 100%;
	}

	:host([is-vertical]) {
		height: 100%;
		width: 1px;
	}
`

export const ZLine = c(
	(props) => (
		<host
			shadowDom
			role="separator"
			aria-orientation={props.isVertical ? 'vertical' : 'horizontal'}
		></host>
	),
	{
		props: {
			isVertical: { type: Boolean, reflect: true },
			isHorizontal: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-line', ZLine)
