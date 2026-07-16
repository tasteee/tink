import { c, css } from 'atomico'

/*
 * z-link — an inline text link. Accent-colored by tone (purple/pink/neutral),
 * with an animated underline that grows from the start on hover. No shadows,
 * no fills — emphasis comes from color and the underline motion alone.
 */
const styles = css`
	:host {
		display: inline-flex;
		user-select: none;
		-webkit-user-select: none;
	}

	:host([is-block]) {
		display: flex;
	}

	:host([is-hidden]) {
		display: none;
	}

	a {
		display: inline-flex;
		align-items: center;
		gap: 0.375em;
		font-family: inherit;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
		line-height: 1.4;
		color: var(--tone-color);
		transition:
			color 0.12s ease,
			opacity 0.12s ease;
		position: relative;
	}

	/* sizes */
	a.is-small {
		font-size: var(--font-size-small);
	}
	a.is-medium {
		font-size: var(--font-size-body);
	}
	a.is-large {
		font-size: var(--font-size-h4);
	}

	/* tones */
	a.is-primary {
		--tone-color: var(--purple);
	}
	a.is-secondary {
		--tone-color: var(--pink);
	}
	a.is-neutral {
		--tone-color: var(--foreground);
	}

	/* animated underline — grows from the leading edge on hover */
	a.is-underline-hover::after,
	a.is-underline-always::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -1px;
		height: 1px;
		width: 100%;
		background: currentColor;
		transform: scaleX(0);
		transform-origin: left center;
		/*transition: transform 0.18s var(--easing-standard, ease-out);*/
	}

	a.is-underline-always::after {
		transform: scaleX(1);
	}

	a.is-underline-hover:hover::after,
	a.is-underline-hover:focus-visible::after,
	a.is-underline-always:hover::after {
		transform: scaleX(1);
	}

	a.is-underline-none:hover {
		opacity: 0.78;
	}

	a:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 3px;
		border-radius: 2px;
	}

	:host([is-disabled]) a {
		color: var(--muted-foreground);
		pointer-events: none;
		opacity: 0.6;
	}

	::slotted(svg) {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
	}

	.external-icon {
		width: 0.82em;
		height: 0.82em;
		flex-shrink: 0;
		stroke: currentColor;
		stroke-width: 1.9;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}
`

const resolveSizeClass = (props: any): string => {
	if (props.size === 'small') return 'is-small'
	if (props.size === 'large') return 'is-large'
	return 'is-medium'
}

const resolveToneClass = (props: any): string => {
	if (props.tone === 'secondary') return 'is-secondary'
	if (props.tone === 'neutral') return 'is-neutral'
	return 'is-primary'
}

const resolveUnderlineClass = (props: any): string => {
	if (props.underline === 'always') return 'is-underline-always'
	if (props.underline === 'none') return 'is-underline-none'
	return 'is-underline-hover'
}

export const ZLink = c(
	(props) => {
		const linkClass = [resolveToneClass(props), resolveSizeClass(props), resolveUnderlineClass(props)].join(' ')
		const isExternal = props.isExternal || props.target === '_blank'

		return (
			<host shadowDom>
				<a
					class={linkClass}
					href={props.isDisabled ? undefined : props.href}
					target={props.target || (props.isExternal ? '_blank' : undefined)}
					rel={isExternal ? 'noopener noreferrer' : undefined}
					aria-disabled={props.isDisabled ? 'true' : undefined}
				>
					{props.label ? props.label : <slot />}
					{isExternal && (
						<svg class="external-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
							<path d="M9 2h5v5" />
							<path d="m14 2-7 7" />
							<path d="M7 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" />
						</svg>
					)}
				</a>
			</host>
		)
	},
	{
		props: {
			href: String,
			target: String,
			label: String,
			size: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			underline: { type: String, reflect: true },
			isExternal: { type: Boolean, reflect: true },
			isBlock: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-link', ZLink)
