import { c, css } from 'atomico'

/*
 * z-bento-item — one cell of a z-bento-grid. Default slot is the body
 * (heading/description); `slot="icon"` sits above it; `slot="background"`
 * (an image, gradient, pattern) fills the cell behind everything and
 * nudges into view on hover. Giving `href` reveals a CTA row pinned to the
 * bottom on hover/focus — omit it for a static cell.
 */
const styles = css`
	:host {
		display: block;
	}

	:host([is-hidden]) {
		display: none;
	}

	.surface {
		position: relative;
		height: 100%;
		box-sizing: border-box;
		overflow: hidden;
		border-radius: var(--radius-lg);
		border: 1px solid var(--border);
		background: var(--card);
		padding: var(--spacing-6);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2);
		transition: border-color 0.15s ease;
	}

	:host(:hover) .surface,
	:host(:focus-within) .surface {
		border-color: color-mix(in oklch, var(--foreground) 45%, transparent);
	}

	.background {
		position: absolute;
		inset: 0;
		z-index: 0;
		opacity: 0.92;
		transition:
			transform 0.35s ease,
			opacity 0.35s ease;
		pointer-events: none;
	}

	:host(:hover) .background {
		transform: scale(1.045);
	}

	::slotted([slot='background']) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.icon {
		position: relative;
		z-index: 1;
		display: inline-flex;
		color: var(--foreground);
	}

	::slotted([slot='icon']) {
		width: 1.75rem;
		height: 1.75rem;
	}

	.body {
		position: relative;
		z-index: 1;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
		justify-content: flex-end;
	}

	.cta {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: var(--font-size-small);
		font-weight: 600;
		color: var(--foreground);
		text-decoration: none;
		transform: translateY(0.5rem);
		opacity: 0;
		transition:
			transform 0.18s ease,
			opacity 0.18s ease;
	}

	:host(:hover) .cta,
	:host(:focus-within) .cta {
		transform: translateY(0);
		opacity: 1;
	}

	.cta svg {
		width: 0.9rem;
		height: 0.9rem;
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
		transition: transform 0.15s ease;
	}

	.cta:hover svg {
		transform: translateX(0.15rem);
	}

	@media (prefers-reduced-motion: reduce) {
		.background,
		.cta {
			transition: none;
		}
	}
`

export const ZBentoItem = c(
	(props) => {
		const colSpan = props.colSpan || 1
		const rowSpan = props.rowSpan || 1

		return (
			<host shadowDom style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}>
				<div class="surface">
					<div class="background" aria-hidden="true">
						<slot name="background" />
					</div>
					<div class="icon">
						<slot name="icon" />
					</div>
					<div class="body">
						<slot />
					</div>
					{props.href && (
						<a class="cta" href={props.href}>
							{props.ctaLabel || 'Learn more'}
							<svg viewBox="0 0 24 24">
								<line x1="5" y1="12" x2="19" y2="12" />
								<polyline points="12 5 19 12 12 19" />
							</svg>
						</a>
					)}
				</div>
			</host>
		)
	},
	{
		props: {
			colSpan: Number,
			rowSpan: Number,
			href: String,
			ctaLabel: String,
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-bento-item', ZBentoItem)
