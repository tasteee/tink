import { c, css } from 'atomico'

/*
 * z-status-dot — a small presence indicator: a colored dot, optionally with a
 * live pulse and a trailing label. Sits on avatars (position the exposed
 * `part="dot"` from the consumer), chat headers, and member lists.
 *
 *   <z-status-dot status="online"></z-status-dot>
 *   <z-status-dot status="dnd" label="Do not disturb"></z-status-dot>
 *   <z-status-dot status="online" pulse></z-status-dot>
 *
 * Colors come from the ink tone tokens; `--color` can be overridden per instance
 * for custom statuses.
 */
const styles = css`
	:host {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		vertical-align: middle;
		--dot: 0.5rem;
		--color: var(--muted-foreground);
	}
	:host([is-hidden]) {
		display: none;
	}

	:host([size='md']) {
		--dot: 0.625rem;
	}
	:host([size='lg']) {
		--dot: 0.75rem;
	}

	:host([status='online']) {
		--color: var(--success);
	}
	:host([status='away']) {
		--color: var(--warning);
	}
	:host([status='dnd']),
	:host([status='busy']) {
		--color: var(--destructive);
	}
	:host([status='offline']) {
		--color: var(--muted-foreground);
	}

	.dot {
		width: var(--dot);
		height: var(--dot);
		border-radius: 999px;
		background: var(--color);
		position: relative;
		flex-shrink: 0;
	}

	:host([pulse]) .dot::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 999px;
		background: var(--color);
		animation: ping 1.6s var(--easing-standard, ease-out) infinite;
	}

	@keyframes ping {
		0% {
			opacity: 0.6;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(2.4);
		}
	}

	.label {
		font-size: 0.8125rem;
		color: var(--muted-foreground);
		line-height: 1;
	}
`

export const ZStatusDot = c(
	(props) => {
		return (
			<host shadowDom role='status' aria-label={props.status || 'status'}>
				<span class='dot' part='dot' aria-hidden='true'></span>
				{props.label && <span class='label'>{props.label}</span>}
			</host>
		)
	},
	{
		props: {
			status: { type: String, reflect: true },
			size: { type: String, reflect: true },
			pulse: { type: Boolean, reflect: true },
			label: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-status-dot', ZStatusDot)
