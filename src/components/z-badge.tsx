import { c, css } from 'atomico'

/*
 * z-badge — a compact pill for status and metadata. Three kinds (soft tint,
 * solid fill, outline) across the full tone set. With `is-dot` it switches to
 * the inline-status style: a leading colored dot + uppercase tracked text on a
 * transparent ground (e.g. • ONLINE). No shadows.
 */
const styles = css`
	:host {
		display: inline-flex;
		vertical-align: middle;
	}

	:host([is-hidden]) {
		display: none;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-family: inherit;
		font-weight: 600;
		line-height: 1;
		white-space: nowrap;
		border: 1px solid transparent;
		border-radius: 999px;
		--tone: var(--color-neutral-7);
	}

	/* tones set --tone */
	.badge.is-primary {
		--tone: var(--purple);
	}
	.badge.is-secondary {
		--tone: var(--pink);
	}
	.badge.is-neutral {
		--tone: var(--color-neutral-7);
	}
	.badge.is-success {
		--tone: var(--success);
	}
	.badge.is-warning {
		--tone: var(--warning);
	}
	.badge.is-danger {
		--tone: var(--destructive);
	}

	/* sizes */
	.badge.is-small {
		font-size: 0.6875rem;
		padding: 0.25rem 0.5rem;
		letter-spacing: 0.01em;
	}
	.badge.is-medium {
		font-size: 0.75rem;
		padding: 0.3125rem 0.625rem;
	}

	/* kinds */
	.badge.is-soft {
		background: color-mix(in oklch, var(--tone) 18%, transparent);
		color: color-mix(in oklch, var(--tone) 80%, white);
	}
	.badge.is-solid {
		background: var(--tone);
		color: var(--primary-foreground);
	}
	/* purple/pink fills are light enough that dark text muddies; use neutral-8. */
	.badge.is-solid.is-primary,
	.badge.is-solid.is-secondary {
		color: var(--color-neutral-8);
	}
	.badge.is-outline {
		background: transparent;
		/* srgb, not oklch: --border carries a faint green hue, and interpolating
		   hue against it in oklch drags the tone around the wheel (purple → blue). */
		border-color: color-mix(in srgb, var(--tone) 45%, var(--border));
		color: var(--tone);
	}
	.badge.is-neutral.is-outline {
		color: var(--muted-foreground);
		border-color: var(--border);
	}

	/* inline status: dot + uppercase tracked text */
	.badge.is-dot {
		background: transparent;
		border-color: transparent;
		padding: 0;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.6875rem;
		color: var(--tone);
		gap: 0.4375rem;
	}
	.dot {
		width: 0.4375rem;
		height: 0.4375rem;
		border-radius: 999px;
		background: var(--tone);
		flex-shrink: 0;
	}

	.is-solid.is-primary .label,
	.is-solid.is-secondary .label {
		text-shadow: 0 0px 18px var(--primary-foreground);
	}

	::slotted(svg) {
		width: 0.875em;
		height: 0.875em;
	}
`

const resolveToneClass = (props: any): string => {
	if (props.tone === 'primary') return 'is-primary'
	if (props.tone === 'secondary') return 'is-secondary'
	if (props.tone === 'success') return 'is-success'
	if (props.tone === 'warning') return 'is-warning'
	if (props.tone === 'danger') return 'is-danger'
	return 'is-neutral'
}

const resolveKindClass = (props: any): string => {
	if (props.kind === 'solid') return 'is-solid'
	if (props.kind === 'outline') return 'is-outline'
	return 'is-soft'
}

export const ZBadge = c(
	(props) => {
		const sizeClass = props.size === 'small' ? 'is-small' : 'is-medium'
		const badgeClass = ['badge', resolveToneClass(props), props.isDot ? 'is-dot' : resolveKindClass(props), sizeClass].join(
			' '
		)

		return (
			<host shadowDom>
				<span class={badgeClass}>
					{props.isDot && <span class='dot' aria-hidden='true'></span>}
					<span class='label'>{props.label ? props.label : <slot />}</span>
				</span>
			</host>
		)
	},
	{
		props: {
			tone: { type: String, reflect: true },
			kind: { type: String, reflect: true },
			size: { type: String, reflect: true },
			label: String,
			isDot: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-badge', ZBadge)
