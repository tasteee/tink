import { c, css } from 'atomico'

/*
 * z-unread-divider — the accented "New messages" line marking where unread
 * messages begin in a thread. Like z-date-divider but toned to draw the eye.
 *
 *   <z-unread-divider></z-unread-divider>
 *   <z-unread-divider label="12 new messages"></z-unread-divider>
 */
const styles = css`
	:host {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin: var(--space-sm) 0;
		--tone: var(--primary);
	}
	:host([tone='secondary']) {
		--tone: var(--pink);
	}
	:host([is-hidden]) {
		display: none;
	}
	.line {
		flex: 1;
		height: 1px;
		background: color-mix(in oklch, var(--tone) 45%, transparent);
	}
	.label {
		font-size: 0.6875rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--tone);
		white-space: nowrap;
	}
`

export const ZUnreadDivider = c(
	(props) => (
		<host shadowDom role="separator" aria-label={props.label || 'New messages'}>
			<span class="line" aria-hidden="true"></span>
			<span class="label">{props.label || 'New messages'}<slot /></span>
			<span class="line" aria-hidden="true"></span>
		</host>
	),
	{
		props: {
			label: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-unread-divider', ZUnreadDivider)
