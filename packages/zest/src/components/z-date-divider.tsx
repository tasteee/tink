import { c, css } from 'atomico'

/*
 * z-date-divider — a centered day separator between message groups
 * ("Today" / "Yesterday" / "March 3"). Pass `label`, or slot custom content.
 *
 *   <z-date-divider label="Today"></z-date-divider>
 */
const styles = css`
	:host {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin: var(--space-sm) 0;
	}
	:host([is-hidden]) {
		display: none;
	}
	.line {
		flex: 1;
		height: 1px;
		background: var(--border);
	}
	.label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--muted-foreground);
		white-space: nowrap;
	}
`

export const ZDateDivider = c(
	(props) => {
		return (
			<host shadowDom>
				<span class='line' aria-hidden='true'></span>
				<span class='label'>{props.label}<slot /></span>
				<span class='line' aria-hidden='true'></span>
			</host>
		)
	},
	{
		props: {
			label: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-date-divider', ZDateDivider)
