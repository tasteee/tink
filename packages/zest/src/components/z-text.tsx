import { c, css } from 'atomico'
import { oneOf } from '../shared/prop-types'

const styles = css`
	:host {
		color: var(--foreground);
	}

	:host([is-hidden]) {
		display: none;
	}

	/* ::selection doesn't cross shadow boundaries, so the page-wide selection
	   style (ink.css) never reaches this component's slotted text, without this
	   you'd get the browser's default blue while the window is focused. Restate
	   it here against the shared --selection-* tokens so prose highlights the
	   same as everything else. */
	::selection {
		background: var(--selection-background);
		color: var(--selection-foreground);
	}

	::-moz-selection {
		background: var(--selection-background);
		color: var(--selection-foreground);
	}

	.text {
		margin: 0;
		padding: 0;
		color: inherit;
		font-family: inherit;
		font-style: normal;
		font-weight: var(--z-text-weight, 400);
		text-decoration: none;
		text-transform: none;
		box-sizing: border-box;
	}

	/* ---------------------------------------------
	   heading
	--------------------------------------------- */

	/* Headings are the one tier a theme may re-face. Everything here defaults
	   back to the sans stack and its weight, so a theme that says nothing gets
	   exactly what it always got; the haze theme swaps in a serif.
	   --font-heading-settings carries variable-font axes, which is how a face
	   like Fraunces gets its optical size and softness set without this
	   component knowing either name. */
	.text.is-heading {
		font-family: var(--font-heading, inherit);
		font-weight: var(--z-text-weight, var(--font-heading-weight, 700));
		font-variation-settings: var(--font-heading-settings, normal);
	}

	.text.is-heading.is-xxl {
		font-size: calc(var(--base-font-size, 16px) * 4);
		line-height: 1.125;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.06 * var(--font-heading-tracking-scale, 1));
	}

	.text.is-heading.is-xl {
		font-size: calc(var(--base-font-size, 16px) * 3.5);
		line-height: 1.142857;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.05 * var(--font-heading-tracking-scale, 1));
	}

	.text.is-heading.is-lg {
		font-size: calc(var(--base-font-size, 16px) * 3);
		line-height: 1.166667;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.04 * var(--font-heading-tracking-scale, 1));
	}

	.text.is-heading.is-md {
		font-size: calc(var(--base-font-size, 16px) * 2.5);
		line-height: 1.3;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.03375 * var(--font-heading-tracking-scale, 1));
	}

	.text.is-heading.is-sm {
		font-size: calc(var(--base-font-size, 16px) * 2);
		line-height: 1.25;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.03 * var(--font-heading-tracking-scale, 1));
	}

	.text.is-heading.is-xs {
		font-size: calc(var(--base-font-size, 16px) * 1.5);
		line-height: 1.333333;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.00625 * var(--font-heading-tracking-scale, 1));
	}

	/* ---------------------------------------------
	   subheading
	--------------------------------------------- */

	.text.is-subheading {
		text-transform: uppercase;
		font-weight: var(--z-text-weight, 600);
	}

	.text.is-subheading.is-xl {
		font-size: calc(var(--base-font-size, 16px) * 1.25);
		line-height: 1.2;
		letter-spacing: calc(var(--base-font-size, 16px) * 0.075);
	}

	.text.is-subheading.is-lg {
		font-size: calc(var(--base-font-size, 16px) * 1.125);
		line-height: 1.333333;
		letter-spacing: calc(var(--base-font-size, 16px) * 0.075);
	}

	.text.is-subheading.is-md {
		font-size: var(--base-font-size, 16px);
		line-height: 1.25;
		letter-spacing: calc(var(--base-font-size, 16px) * 0.075);
	}

	.text.is-subheading.is-sm {
		font-size: calc(var(--base-font-size, 16px) * 0.875);
		line-height: 1.428571;
		letter-spacing: calc(var(--base-font-size, 16px) * 0.05);
	}

	.text.is-subheading.is-xs {
		font-size: calc(var(--base-font-size, 16px) * 0.75);
		line-height: 1.333333;
		letter-spacing: calc(var(--base-font-size, 16px) * 0.05);
	}

	/* ---------------------------------------------
	   text / paragraph
	--------------------------------------------- */

	.text.is-text {
		font-weight: var(--z-text-weight, 400);
	}

	.text.is-text.is-xxl {
		font-size: calc(var(--base-font-size, 16px) * 1.5);
		line-height: 1.666667;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.0275);
	}

	.text.is-text.is-xl {
		font-size: calc(var(--base-font-size, 16px) * 1.25);
		line-height: 1.6;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.02);
	}

	.text.is-text.is-lg {
		font-size: calc(var(--base-font-size, 16px) * 1.125);
		line-height: 1.777778;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.01625);
	}

	.text.is-text.is-md {
		font-size: var(--base-font-size, 16px);
		line-height: 1.75;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.01125);
	}

	.text.is-text.is-sm {
		font-size: calc(var(--base-font-size, 16px) * 0.875);
		line-height: 1.714286;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.005);
	}

	.text.is-text.is-xs {
		font-size: calc(var(--base-font-size, 16px) * 0.75);
		line-height: 1.333333;
		letter-spacing: 0;
	}

	/* ---------------------------------------------
	   label
	--------------------------------------------- */

	.text.is-label {
		color: var(--color-neutral-5);
		font-size: var(--font-size-small);
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.04em;
		text-transform: lowercase;
		font-variant-caps: all-small-caps;
		user-select: none;
		-webkit-user-select: none;
	}

	/* ---------------------------------------------
	   colors
	--------------------------------------------- */

	.text.is-neutral {
		color: var(--foreground);
	}

	.text.is-primary {
		color: var(--purple);
	}

	.text.is-secondary {
		color: var(--pink);
	}

	.text.is-muted {
		color: var(--muted-foreground);
	}

	.text.is-strong {
		color: var(--color-neutral-9);
	}

	.text.is-success {
		color: var(--success);
	}

	.text.is-warning {
		color: var(--warning);
	}

	.text.is-danger {
		color: var(--destructive);
	}



	/* ---------------------------------------------
	   decoration overrides
	--------------------------------------------- */

	.text.is-italic {
		font-style: italic;
	}

	.text.is-underlined {
		text-decoration: underline;
	}

	.text.is-strikethrough {
		text-decoration: line-through;
	}

	.text.is-underlined.is-strikethrough {
		text-decoration: underline line-through;
	}

	/* ---------------------------------------------
	   inline (z-inline), carries no size opinion of its
	   own. font-size/line-height/letter-spacing/font-family
	   inherit from whatever it's dropped into, so it can sit
	   inside a z-text/z-heading of any size without silently
	   resetting to the md default. Only color, weight, and
	   italic/underline/strikethrough are overridable.
	--------------------------------------------- */

	.inline {
		margin: 0;
		padding: 0;
		color: inherit;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		letter-spacing: inherit;
		font-weight: var(--z-text-weight, inherit);
		font-style: inherit;
		text-decoration: inherit;
		text-transform: inherit;
		box-sizing: border-box;
	}

	.inline.is-primary {
		color: var(--purple);
	}

	.inline.is-secondary {
		color: var(--pink);
	}

	.inline.is-muted {
		color: var(--muted-foreground);
	}

	.inline.is-strong {
		color: var(--color-neutral-9);
	}

	.inline.is-neutral {
		color: var(--foreground);
	}

	.inline.is-success {
		color: var(--success);
	}

	.inline.is-warning {
		color: var(--warning);
	}

	.inline.is-danger {
		color: var(--destructive);
	}






	.inline.is-italic {
		font-style: italic;
	}

	.inline.is-underlined {
		text-decoration: underline;
	}

	.inline.is-strikethrough {
		text-decoration: line-through;
	}

	.inline.is-underlined.is-strikethrough {
		text-decoration: underline line-through;
	}
`

const resolveSizeClass = (props: any, fallback: string): string => {
	if (props.size === 'xxl') return 'is-xxl'
	if (props.size === 'xl') return 'is-xl'
	if (props.size === 'lg') return 'is-lg'
	if (props.size === 'md') return 'is-md'
	if (props.size === 'sm') return 'is-sm'
	if (props.size === 'xs') return 'is-xs'
	return fallback
}

const resolveColorClass = (props: any): string => {
	if (props.color === 'primary') return 'is-primary'
	if (props.color === 'secondary') return 'is-secondary'
	if (props.color === 'muted') return 'is-muted'
	if (props.color === 'strong') return 'is-strong'
	if (props.color === 'success') return 'is-success'
	if (props.color === 'warning') return 'is-warning'
	if (props.color === 'danger') return 'is-danger'
	return 'is-neutral'
}

// Weight is passed straight through to CSS rather than mapped onto a fixed
// ladder of classes. A variable face has a continuous weight axis, so pinning
// the API to 300/400/600/700/900 would put 850 — a perfectly real weight in DM
// Sans, which runs to 1000 — out of reach for no reason.
//
// An absent weight must resolve to nothing at all, not to a number: each
// variant carries its own base weight as the var()'s fallback (heading reads
// the theme's --font-heading-weight and text reads 400), and emitting a
// value here would clobber all of them.
const resolveWeightStyle = (props: any): string => {
	const isNumber = typeof props.weight === 'number'
	const hasWeight = isNumber && Number.isFinite(props.weight)
	if (!hasWeight) return ''
	return String(props.weight)
}

/*
 * The visual size scale and the semantic heading levels are the same six steps,
 * so the tag is derived straight from `size` (xxl→h1 … xs→h6) rather than
 * carrying a separate `level` prop. When you need the element to diverge from
 * its visual weight (a large-looking h2, say), the `tag` prop overrides.
 */
const SIZE_TO_HEADING_TAG: Record<string, string> = {
	xxl: 'h1',
	xl: 'h2',
	lg: 'h3',
	md: 'h4',
	sm: 'h5',
	xs: 'h6'
}

const resolveHeadingTag = (props: any): string => {
	if (props.tag) return props.tag
	return SIZE_TO_HEADING_TAG[props.size] || 'h4'
}

const resolveTextClass = (props: any, variantClass: string, fallbackSizeClass: string): string => {
	const sizeClass = resolveSizeClass(props, fallbackSizeClass)
	const colorClass = resolveColorClass(props)

	return ['text', variantClass, sizeClass, colorClass]
		.concat(props.isItalic ? ['is-italic'] : [])
		.concat(props.isUnderlined ? ['is-underlined'] : [])
		.concat(props.isStrikethrough ? ['is-strikethrough'] : [])
		.join(' ')
}

const resolveInlineColorClass = (props: any): string => {
	if (props.color === 'primary') return 'is-primary'
	if (props.color === 'secondary') return 'is-secondary'
	if (props.color === 'muted') return 'is-muted'
	if (props.color === 'strong') return 'is-strong'
	if (props.color === 'neutral') return 'is-neutral'
	// No explicit color: emit no override class so color inherits from
	// whatever context this is dropped into, instead of forcing --foreground.
	return ''
}

const resolveInlineClass = (props: any): string => {
	const colorClass = resolveInlineColorClass(props)

	return ['inline']
		.concat(colorClass ? [colorClass] : [])
		.concat(props.isItalic ? ['is-italic'] : [])
		.concat(props.isUnderlined ? ['is-underlined'] : [])
		.concat(props.isStrikethrough ? ['is-strikethrough'] : [])
		.join(' ')
}

const baseTextProps = {
	color: { type: oneOf('neutral', 'primary', 'secondary', 'success', 'warning', 'danger', 'muted', 'strong'), reflect: true },
	weight: { type: Number, reflect: true },
	tag: String,
	isHidden: { type: Boolean, reflect: true },
	isItalic: { type: Boolean, reflect: true },
	isUnderlined: { type: Boolean, reflect: true },
	isStrikethrough: { type: Boolean, reflect: true }
}

const zHeadingProps = {
	...baseTextProps,
	size: { type: oneOf('xs', 'sm', 'md', 'lg', 'xl', 'xxl'), reflect: true }
}

export const ZHeading = c(
	(props) => {
		const Tag = resolveHeadingTag(props) as any
		const className = resolveTextClass(props, 'is-heading', 'is-md')

		return (
			<host shadowDom style={{ '--z-text-weight': resolveWeightStyle(props) }}>
				<Tag class={className}>
					<slot />
				</Tag>
			</host>
		)
	},
	{
		props: zHeadingProps,
		styles
	}
)

const zSubheadingProps = {
	...baseTextProps,
	size: { type: oneOf('xs', 'sm', 'md', 'lg', 'xl'), reflect: true }
}

export const ZSubheading = c(
	(props) => {
		const Tag = (props.tag || 'p') as any
		const className = resolveTextClass(props, 'is-subheading', 'is-md')

		return (
			<host shadowDom style={{ '--z-text-weight': resolveWeightStyle(props) }}>
				<Tag class={className}>
					<slot />
				</Tag>
			</host>
		)
	},
	{
		props: zSubheadingProps,
		styles
	}
)

const zTextProps = {
	...baseTextProps,
	size: { type: oneOf('xs', 'sm', 'md', 'lg', 'xl', 'xxl'), reflect: true }
}

export const ZText = c(
	(props) => {
		const Tag = (props.tag || 'p') as any
		const className = resolveTextClass(props, 'is-text', 'is-md')

		return (
			<host shadowDom style={{ '--z-text-weight': resolveWeightStyle(props) }}>
				<Tag class={className}>
					<slot />
				</Tag>
			</host>
		)
	},
	{
		props: zTextProps,
		styles
	}
)

export const ZLabel = c(
	(props) => {
		const Tag = (props.tag || 'span') as any
		const className = resolveTextClass(props, 'is-label', 'is-md')

		return (
			<host shadowDom style={{ '--z-text-weight': resolveWeightStyle(props) }}>
				<Tag class={className}>
					<slot />
				</Tag>
			</host>
		)
	},
	{
		props: baseTextProps,
		styles
	}
)

const inlineProps = {
	color: { type: oneOf('neutral', 'primary', 'secondary', 'muted', 'strong'), reflect: true },
	weight: { type: Number, reflect: true },
	tag: String,
	isHidden: { type: Boolean, reflect: true },
	isItalic: { type: Boolean, reflect: true },
	isUnderlined: { type: Boolean, reflect: true },
	isStrikethrough: { type: Boolean, reflect: true }
}

export const ZInline = c(
	(props) => {
		const Tag = (props.tag || 'span') as any
		const className = resolveInlineClass(props)

		return (
			<host shadowDom style={{ '--z-text-weight': resolveWeightStyle(props) }}>
				<Tag class={className}>
					<slot />
				</Tag>
			</host>
		)
	},
	{
		props: inlineProps,
		styles
	}
)
