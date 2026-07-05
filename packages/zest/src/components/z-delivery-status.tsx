import { c, css } from 'atomico'

/*
 * z-delivery-status — the tiny send-state indicator next to a sent message:
 * sending (clock) → sent (✓) → delivered (✓✓) → read (blue ✓✓), plus an error
 * state. Sits in a message's meta row.
 *
 *   <z-delivery-status status="read"></z-delivery-status>
 *
 * The read color is `--read-color` (override per theme).
 */
const styles = css`
	:host {
		display: inline-flex;
		vertical-align: middle;
		--read-color: oklch(0.7 0.14 230);
		color: var(--muted-foreground);
	}
	:host([is-hidden]) {
		display: none;
	}
	:host([status='read']) {
		color: var(--read-color);
	}
	:host([status='error']) {
		color: var(--destructive);
	}
	svg {
		width: 1.05rem;
		height: 1.05rem;
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
`

export const ZDeliveryStatus = c(
	(props) => {
		const status = (props.status as string) || 'sent'

		let glyph
		if (status === 'sending') {
			glyph = (
				<svg viewBox="0 0 24 24" aria-label="Sending">
					<circle cx="12" cy="12" r="8" />
					<path d="M12 8v4l2.5 2" />
				</svg>
			)
		} else if (status === 'error') {
			glyph = (
				<svg viewBox="0 0 24 24" aria-label="Failed">
					<circle cx="12" cy="12" r="9" />
					<path d="M12 8v4M12 16h.01" />
				</svg>
			)
		} else if (status === 'sent') {
			glyph = (
				<svg viewBox="0 0 24 24" aria-label="Sent">
					<path d="M4 12.5l5 5L20 6.5" />
				</svg>
			)
		} else {
			// delivered / read — double check
			glyph = (
				<svg viewBox="0 0 28 24" aria-label={status === 'read' ? 'Read' : 'Delivered'}>
					<path d="M2 12.5l5 5L18 6.5" />
					<path d="M10 12.5l5 5L26 6.5" />
				</svg>
			)
		}

		return (
			<host shadowDom role="img" aria-label={status}>
				{glyph}
			</host>
		)
	},
	{
		props: {
			status: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-delivery-status', ZDeliveryStatus)
