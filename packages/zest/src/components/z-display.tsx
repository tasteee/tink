import { c, css } from 'atomico'

/*
 * z-display — oversized, fluid display type for hero titles: the tier above
 * z-heading's fixed scale. Where z-heading tops out at a fixed 4rem (xxl), a
 * display title clamps with the viewport (sm…xl) so it fills the space on a
 * wide screen and stays readable on a phone. Renders an <h1> by default;
 * override with `tag`. Shares z-text's color/weight vocabulary so a page's
 * type reads from one palette.
 */
const styles = css`
	:host {
		display: block;
		color: var(--foreground);
	}

	:host([is-hidden]) {
		display: none;
	}

	/* ::selection doesn't cross shadow boundaries — restate it against the shared
	   tokens so a highlighted title matches the rest of the page (see z-text). */
	::selection {
		background: var(--selection-background);
		color: var(--selection-foreground);
	}
	::-moz-selection {
		background: var(--selection-background);
		color: var(--selection-foreground);
	}

	.display {
		margin: 0;
		padding: 0;
		font-family: inherit;
		font-weight: 700;
		line-height: 0.95;
		letter-spacing: -0.03em;
		color: inherit;
		text-wrap: balance;
	}

	.display.is-xl {
		font-size: clamp(3.5rem, 11vw, 7.5rem);
	}
	.display.is-lg {
		font-size: clamp(3rem, 9vw, 6rem);
	}
	.display.is-md {
		font-size: clamp(2.5rem, 7vw, 4.5rem);
	}
	.display.is-sm {
		font-size: clamp(2rem, 5vw, 3.25rem);
	}

	/* colors — same vocabulary as z-text (neutral default = --foreground) */
	.display.is-primary {
		color: var(--purple);
	}
	.display.is-secondary {
		color: var(--pink);
	}
	.display.is-muted {
		color: var(--muted-foreground);
	}
	.display.is-white {
		color: var(--color-neutral-9);
	}

	/* weight overrides */
	.display.is-weight-900 {
		font-weight: 900;
	}
	.display.is-weight-700 {
		font-weight: 700;
	}
	.display.is-weight-600 {
		font-weight: 600;
	}
	.display.is-weight-400 {
		font-weight: 400;
	}
	.display.is-weight-300 {
		font-weight: 300;
	}
`

const SIZE_CLASS: Record<string, string> = {
	xl: 'is-xl',
	lg: 'is-lg',
	md: 'is-md',
	sm: 'is-sm'
}

const resolveDisplayClass = (props: any): string => {
	const sizeClass = SIZE_CLASS[props.size] || 'is-lg'
	const colorClass =
		props.color === 'primary'
			? 'is-primary'
			: props.color === 'secondary'
				? 'is-secondary'
				: props.color === 'muted'
					? 'is-muted'
					: props.color === 'white'
						? 'is-white'
						: ''
	const weightClass = props.weight ? `is-weight-${props.weight}` : ''

	return ['display', sizeClass]
		.concat(colorClass ? [colorClass] : [])
		.concat(weightClass ? [weightClass] : [])
		.join(' ')
}

export const ZDisplay = c(
	(props) => {
		const Tag = (props.tag || 'h1') as any
		return (
			<host shadowDom>
				<Tag class={resolveDisplayClass(props)}>
					<slot />
				</Tag>
			</host>
		)
	},
	{
		props: {
			size: { type: String, reflect: true },
			color: { type: String, reflect: true },
			weight: { type: String, reflect: true },
			tag: String,
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-display', ZDisplay)
