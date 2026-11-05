import { defineElement } from '../shared/define-element'
import { c, css } from 'atomico'
import { oneOf } from '../shared/prop-types'

/*
 * z-display, oversized, fluid display type for hero titles: the tier above
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

	/* ::selection doesn't cross shadow boundaries, restate it against the shared
	   tokens so a highlighted title matches the rest of the page (see z-text). */
	::selection {
		background: var(--selection-background);
		color: var(--selection-foreground);
	}
	::-moz-selection {
		background: var(--selection-background);
		color: var(--selection-foreground);
	}

	/* Same heading tier as z-text's is-heading, and re-faced by the same
	   tokens — a theme that gives headings a serif has to reach the display
	   tier too, or the largest type on the page is the one that misses it.
	   Every token falls back to what this rule used to hardcode. */
	.display {
		margin: 0;
		padding: 0;
		font-family: var(--font-heading, inherit);
		font-weight: var(--z-text-weight, var(--font-heading-weight, 700));
		font-variation-settings: var(--font-heading-settings, normal);
		line-height: 0.95;
		letter-spacing: calc(-0.03em * var(--font-heading-tracking-scale, 1));
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

	/* colors, same vocabulary as z-text (neutral default = --foreground) */
	.display.is-primary {
		color: var(--purple);
	}
	.display.is-secondary {
		color: var(--pink);
	}
	.display.is-muted {
		color: var(--muted-foreground);
	}
	.display.is-strong {
		color: var(--color-neutral-9);
	}

`

const SIZE_CLASS: Record<string, string> = {
	xl: 'is-xl',
	lg: 'is-lg',
	md: 'is-md',
	sm: 'is-sm'
}

// Same pass-through as z-text: any value the face supports, not a fixed
// ladder. Empty means "say nothing", so --font-heading-weight keeps deciding.
const resolveWeightStyle = (props: any): string => {
	const isNumber = typeof props.weight === 'number'
	const hasWeight = isNumber && Number.isFinite(props.weight)
	if (!hasWeight) return ''
	return String(props.weight)
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
					: props.color === 'strong'
						? 'is-strong'
						: ''
	return ['display', sizeClass]
		.concat(colorClass ? [colorClass] : [])
		.join(' ')
}

export const ZDisplay = c(
	(props) => {
		const Tag = (props.tag || 'h1') as any
		return (
			<host shadowDom style={{ '--z-text-weight': resolveWeightStyle(props) }}>
				<Tag class={resolveDisplayClass(props)}>
					<slot />
				</Tag>
			</host>
		)
	},
	{
		props: {
			size: { type: oneOf('sm', 'md', 'lg', 'xl'), reflect: true },
			color: { type: String, reflect: true },
			weight: { type: Number, reflect: true },
			tag: String,
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

defineElement('z-display', ZDisplay)
