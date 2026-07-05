import { c, css } from 'atomico'

/*
 * z-system-message — a centered, muted status line for non-message events
 * ("Alice added Bob", "You started a call", "Messages are end-to-end
 * encrypted"). Pass `label` or slot content.
 *
 *   <z-system-message label="Alice added Bob to the chat"></z-system-message>
 */
const styles = css`
	:host {
		display: flex;
		justify-content: center;
		margin: var(--space-xs) 0;
	}
	:host([is-hidden]) {
		display: none;
	}
	.pill {
		font-size: 0.75rem;
		color: var(--muted-foreground);
		background: color-mix(in oklch, var(--foreground) 6%, transparent);
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		text-align: center;
		max-width: 80%;
	}
`

export const ZSystemMessage = c(
	(props) => {
		return (
			<host shadowDom>
				<span class='pill'>{props.label}<slot /></span>
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

customElements.define('z-system-message', ZSystemMessage)
