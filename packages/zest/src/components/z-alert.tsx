import { c, css, event, useProp } from 'atomico'

/*
 * z-alert — an inline, in-flow status banner (not a floating overlay). A
 * bordered box tinted by `tone` (info / success / warning / danger / neutral),
 * with a leading status icon, an optional `heading`, slotted body copy, and an
 * optional close button (`is-dismissable`). Red/amber/green are reserved for
 * their semantic tones — everything else reads through the neutral border.
 */
const styles = css`
	:host {
		display: block;
		--alert-color: var(--muted-foreground);
	}

	:host([tone='info']) {
		--alert-color: var(--purple);
	}
	:host([tone='success']) {
		--alert-color: var(--success);
	}
	:host([tone='warning']) {
		--alert-color: var(--warning);
	}
	:host([tone='danger']) {
		--alert-color: var(--destructive);
	}

	:host([is-hidden]) {
		display: none;
	}

	.alert {
		display: flex;
		gap: 0.75rem;
		box-sizing: border-box;
		padding: var(--space-md) var(--space-base);
		/* srgb: oklch would drift the hue when mixing the chromatic alert colour
		   against the hue-carrying --border. */
		border: 1px solid color-mix(in srgb, var(--alert-color) 40%, var(--border));
		border-radius: var(--radius-md);
		background: color-mix(in oklch, var(--alert-color) 8%, transparent);
		color: var(--foreground);
	}

	.icon {
		display: inline-flex;
		flex-shrink: 0;
		width: 1.125rem;
		height: 1.125rem;
		margin-top: 0.0625rem;
		color: var(--alert-color);
	}

	.icon svg {
		width: 100%;
		height: 100%;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.title {
		margin: 0;
		font-size: var(--font-size-small);
		font-weight: 600;
		line-height: 1.4;
		color: var(--foreground);
	}

	.body {
		font-size: var(--font-size-small);
		line-height: var(--line-height-body);
		color: var(--muted-foreground);
	}

	.close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		flex-shrink: 0;
		margin: -0.25rem -0.25rem 0 0;
		background: transparent;
		border: 0;
		border-radius: var(--radius-sm);
		color: var(--muted-foreground);
		cursor: pointer;
		transition:
			color 0.12s ease,
			background-color 0.12s ease;
	}

	.close:hover {
		color: var(--foreground);
		background: color-mix(in oklch, var(--foreground) 8%, transparent);
	}

	.close:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	.close svg {
		width: 0.875rem;
		height: 0.875rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		fill: none;
	}
`

const ICONS: Record<string, any> = {
	info: <circle cx="12" cy="12" r="9" />,
	success: <polyline points="5 13 10 18 19 6" />,
	warning: <path d="M12 3 2 20h20L12 3Z M12 10v5 M12 17.5v.5" />,
	danger: <path d="M12 3 2 20h20L12 3Z M12 10v5 M12 17.5v.5" />,
	neutral: <circle cx="12" cy="12" r="9" />
}

export const ZAlert = c(
	(props) => {
		const [isHidden, setIsHidden] = useProp<boolean>('isHidden')
		const tone = (props.tone as string) || 'neutral'

		const dismiss = () => {
			setIsHidden(true)
			props.dismiss()
		}

		return (
			<host shadowDom>
				<div class="alert" role={tone === 'danger' || tone === 'warning' ? 'alert' : 'status'}>
					<span class="icon" aria-hidden="true">
						<svg viewBox="0 0 24 24">{ICONS[tone] || ICONS.neutral}</svg>
					</span>
					<div class="content">
						{props.heading && <p class="title">{props.heading}</p>}
						<div class="body">
							<slot />
						</div>
					</div>
					{props.isDismissable && (
						<button type="button" class="close" aria-label="Dismiss" onclick={dismiss}>
							<svg viewBox="0 0 24 24">
								<line x1="6" y1="6" x2="18" y2="18" />
								<line x1="18" y1="6" x2="6" y2="18" />
							</svg>
						</button>
					)}
				</div>
			</host>
		)
	},
	{
		props: {
			tone: { type: String, reflect: true },
			heading: String,
			isDismissable: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			dismiss: event<void>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-alert', ZAlert)
