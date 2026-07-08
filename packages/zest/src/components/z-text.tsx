import { c, css } from 'atomico'

const styles = css`
	:host {
		color: var(--foreground);
	}

	:host([is-hidden]) {
		display: none;
	}

	/* ::selection doesn't cross shadow boundaries, so the page-wide selection
	   style (ink.css) never reaches this component's slotted text — without this
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
		font-weight: 400;
		text-decoration: none;
		text-transform: none;
		box-sizing: border-box;
	}

	/* ---------------------------------------------
	   heading
	--------------------------------------------- */

	.text.is-heading {
		font-weight: 700;
	}

	.text.is-heading.is-xxl {
		font-size: calc(var(--base-font-size, 16px) * 4);
		line-height: 1.125;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.06);
	}

	.text.is-heading.is-xl {
		font-size: calc(var(--base-font-size, 16px) * 3.5);
		line-height: 1.142857;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.05);
	}

	.text.is-heading.is-lg {
		font-size: calc(var(--base-font-size, 16px) * 3);
		line-height: 1.166667;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.04);
	}

	.text.is-heading.is-md {
		font-size: calc(var(--base-font-size, 16px) * 2.5);
		line-height: 1.3;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.03375);
	}

	.text.is-heading.is-sm {
		font-size: calc(var(--base-font-size, 16px) * 2);
		line-height: 1.25;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.03);
	}

	.text.is-heading.is-xs {
		font-size: calc(var(--base-font-size, 16px) * 1.5);
		line-height: 1.333333;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.00625);
	}

	/* ---------------------------------------------
	   subheading
	--------------------------------------------- */

	.text.is-subheading {
		text-transform: uppercase;
		font-weight: 600;
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
		font-weight: 400;
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
		font-weight: 500;
	}

	.text.is-label.is-lg {
		font-size: calc(var(--base-font-size, 16px) * 1.125);
		line-height: 1.333333;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.015);
	}

	.text.is-label.is-md {
		font-size: var(--base-font-size, 16px);
		line-height: 1.5;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.01125);
	}

	.text.is-label.is-sm {
		font-size: calc(var(--base-font-size, 16px) * 0.875);
		line-height: 1.428571;
		letter-spacing: calc(var(--base-font-size, 16px) * -0.005);
	}

	.text.is-label.is-xs {
		font-size: calc(var(--base-font-size, 16px) * 0.75);
		line-height: 1.333333;
		letter-spacing: 0;
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

	.text.is-white {
		color: var(--color-neutral-9);
	}

	/* ---------------------------------------------
	   weight overrides
	--------------------------------------------- */

	.text.is-weight-900 {
		font-weight: 900;
	}

	.text.is-weight-700 {
		font-weight: 700;
	}

	.text.is-weight-600 {
		font-weight: 600;
	}

	.text.is-weight-400 {
		font-weight: 400;
	}

	.text.is-weight-300 {
		font-weight: 300;
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
	   inline (z-inline) — carries no size opinion of its
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
		font-weight: inherit;
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

	.inline.is-white {
		color: var(--color-neutral-9);
	}

	.inline.is-neutral {
		color: var(--foreground);
	}

	.inline.is-weight-900 {
		font-weight: 900;
	}

	.inline.is-weight-700 {
		font-weight: 700;
	}

	.inline.is-weight-600 {
		font-weight: 600;
	}

	.inline.is-weight-400 {
		font-weight: 400;
	}

	.inline.is-weight-300 {
		font-weight: 300;
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
	if (props.color === 'white') return 'is-white'
	return 'is-neutral'
}

const resolveWeightClass = (props: any): string => {
	if (props.weight === '900') return 'is-weight-900'
	if (props.weight === '700') return 'is-weight-700'
	if (props.weight === '600') return 'is-weight-600'
	if (props.weight === '400') return 'is-weight-400'
	if (props.weight === '300') return 'is-weight-300'
	// No explicit weight: emit no override class so each variant keeps its own
	// base weight (heading 700, label 500, text/subheading per their rules).
	// Returning is-weight-400 here previously clobbered the heading weight.
	return ''
}

/*
 * The visual size scale and the semantic heading levels are the same six steps,
 * so the tag is derived straight from `size` (xxl→h1 … xs→h6) rather than
 * carrying a separate `level` prop. When you need the element to diverge from
 * its visual weight — a large-looking h2, say — the `tag` prop overrides.
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
	const weightClass = resolveWeightClass(props)

	return ['text', variantClass, sizeClass, colorClass]
		.concat(weightClass ? [weightClass] : [])
		.concat(props.isItalic ? ['is-italic'] : [])
		.concat(props.isUnderlined ? ['is-underlined'] : [])
		.concat(props.isStrikethrough ? ['is-strikethrough'] : [])
		.join(' ')
}

const resolveInlineColorClass = (props: any): string => {
	if (props.color === 'primary') return 'is-primary'
	if (props.color === 'secondary') return 'is-secondary'
	if (props.color === 'muted') return 'is-muted'
	if (props.color === 'white') return 'is-white'
	if (props.color === 'neutral') return 'is-neutral'
	// No explicit color: emit no override class so color inherits from
	// whatever context this is dropped into, instead of forcing --foreground.
	return ''
}

const resolveInlineClass = (props: any): string => {
	const colorClass = resolveInlineColorClass(props)
	const weightClass = resolveWeightClass(props)

	return ['inline']
		.concat(colorClass ? [colorClass] : [])
		.concat(weightClass ? [weightClass] : [])
		.concat(props.isItalic ? ['is-italic'] : [])
		.concat(props.isUnderlined ? ['is-underlined'] : [])
		.concat(props.isStrikethrough ? ['is-strikethrough'] : [])
		.join(' ')
}

const textProps = {
	size: { type: String, reflect: true },
	color: { type: String, reflect: true },
	weight: { type: String, reflect: true },
	tag: String,
	isHidden: { type: Boolean, reflect: true },
	isItalic: { type: Boolean, reflect: true },
	isUnderlined: { type: Boolean, reflect: true },
	isStrikethrough: { type: Boolean, reflect: true }
}

export const ZHeading = c(
	(props) => {
		const Tag = resolveHeadingTag(props) as any
		const className = resolveTextClass(props, 'is-heading', 'is-md')

		return (
			<host shadowDom>
				<Tag class={className}>
					<slot />
				</Tag>
			</host>
		)
	},
	{
		props: textProps,
		styles
	}
)

export const ZSubheading = c(
	(props) => {
		const Tag = (props.tag || 'p') as any
		const className = resolveTextClass(props, 'is-subheading', 'is-md')

		return (
			<host shadowDom>
				<Tag class={className}>
					<slot />
				</Tag>
			</host>
		)
	},
	{
		props: textProps,
		styles
	}
)

export const ZText = c(
	(props) => {
		const Tag = (props.tag || 'p') as any
		const className = resolveTextClass(props, 'is-text', 'is-md')

		return (
			<host shadowDom>
				<Tag class={className}>
					<slot />
				</Tag>
			</host>
		)
	},
	{
		props: textProps,
		styles
	}
)

export const ZLabel = c(
	(props) => {
		const Tag = (props.tag || 'span') as any
		const className = resolveTextClass(props, 'is-label', 'is-md')

		return (
			<host shadowDom>
				<Tag class={className}>
					<slot />
				</Tag>
			</host>
		)
	},
	{
		props: textProps,
		styles
	}
)

const inlineProps = {
	color: { type: String, reflect: true },
	weight: { type: String, reflect: true },
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
			<host shadowDom>
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

customElements.define('z-heading', ZHeading)
customElements.define('z-subheading', ZSubheading)
customElements.define('z-text', ZText)
customElements.define('z-label', ZLabel)
customElements.define('z-inline', ZInline)
