import { oneOf } from './prop-types'
import { coerceSize, insetProps, resolveAlign, resolveGridAlign, resolveJustify, resolveSize } from './layout-schema'

const isPureNumber = (value: string): boolean => /^-?\d+$/.test(value)

// z-box reads a bare number as a step on the semantic space scale
// (gap="5" is --space-lg), which is what every existing layout was
// written against. Tokens ("sm") and lengths ("1rem") still go
// through the shared resolver.
const SPACE_SCALE_STEPS: Record<number, string> = {
	0: '0',
	1: 'var(--space-xs)',
	2: 'var(--space-sm)',
	3: 'var(--space-md)',
	4: 'var(--space-base)',
	5: 'var(--space-lg)',
	6: 'var(--space-xl)',
	7: 'var(--space-2xl)',
	8: 'var(--space-3xl)'
}

export const resolveBoxSpacing = (value?: string | number): string | undefined => {
	const isEmpty = value == null || value === ''
	if (isEmpty) return undefined
	const text = String(value)
	const isStep = isPureNumber(text)
	if (!isStep) return coerceSize(text)
	const step = Number(text)
	return SPACE_SCALE_STEPS[step] ?? `calc(var(--space-base) * ${step})`
}

const resolveLengthValue = (value?: string): string | undefined => {
	if (value == null || value === '') return undefined
	return isPureNumber(value) ? `${value}px` : value
}

const resolveGridTemplateValue = (value?: string): string | undefined => {
	if (value == null || value === '') return undefined
	return isPureNumber(value) ? `repeat(${value}, minmax(0, 1fr))` : value
}

/*
 * The box used to carry seven booleans for one CSS display value. They are
 * one enum now: `display` is `flex` (the default) or `grid`. `is-inline`
 * composes with either (inline-flex / inline-grid). Grid takes `columns`,
 * `rows`, and per-breakpoint column counts.
 */
export const boxBooleanProps = {
	isInline: { type: Boolean, reflect: true },
	doesWrap: { type: Boolean, reflect: true },
	doesWrapText: { type: Boolean, reflect: true },
	isFullWidth: { type: Boolean, reflect: true },
	isFullHeight: { type: Boolean, reflect: true }
} as const

export const boxValueProps = {
	gap: String,
	rowGap: String,
	columnGap: String,
	margin: String,
	marginTop: String,
	marginRight: String,
	marginBottom: String,
	marginLeft: String,
	marginX: String,
	marginY: String,
	padding: String,
	paddingTop: String,
	paddingRight: String,
	paddingBottom: String,
	paddingLeft: String,
	paddingX: String,
	paddingY: String,
	width: String,
	minWidth: String,
	maxWidth: String,
	height: String,
	minHeight: String,
	maxHeight: String,
	direction: { type: oneOf('horizontal', 'vertical'), reflect: true },
	display: { type: oneOf('flex', 'grid'), reflect: true },
	columns: String,
	rows: String,
	smallColumns: String,
	mediumColumns: String,
	largeColumns: String,
	extraLargeColumns: String,
	alignsX: { type: oneOf('start', 'center', 'end', 'between', 'around', 'evenly', 'stretch') },
	alignsY: { type: oneOf('start', 'center', 'end', 'between', 'around', 'evenly', 'stretch') },
	...insetProps
} as const

export const boxProps = { ...boxBooleanProps, ...boxValueProps }

const omitProps = (source: Record<string, unknown>, keys: string[]): Record<string, unknown> => {
	const result: Record<string, unknown> = {}
	for (const key of Object.keys(source)) {
		if (!keys.includes(key)) result[key] = source[key]
	}
	return result
}

/* z-row/z-column expose every box prop except direction — their own tag name
 * already fixes the flow, so reflecting a redundant (or contradictory)
 * direction attribute would just be confusing. */
export const directionLockedBoxProps = omitProps(boxProps, [
	'direction',
	'display',
	'columns',
	'rows',
	'smallColumns',
	'mediumColumns',
	'largeColumns',
	'extraLargeColumns'
])

type BoxHostPropsT = { [K in keyof typeof boxValueProps]?: string }

/*
 * z-box is the generic flex primitive. `aligns-x`/`aligns-y` are always the
 * horizontal/vertical relationship regardless of flow direction, so they swap
 * which axis they drive: in a horizontal box aligns-x is the main axis, in a
 * vertical box it's the cross axis. z-row/z-column are thin wrappers that lock
 * the direction.
 */
export const getBoxHostStyle = (props: BoxHostPropsT): Record<string, string> => {
	const style: Record<string, string> = {}

	const set = (variable: string, value?: string) => {
		if (value !== undefined) style[variable] = value
	}

	// Every edge resolves to one longhand variable, most specific prop first:
	// per-side beats axis beats all-sides, and inset is the padding default
	// underneath all three. The stylesheet reads only the longhands — it used
	// to also declare `padding: var(--z-box-padding)` and then the four
	// longhands after it, so with `padding="lg"` alone the longhands' unset
	// var()s were invalid at computed-value time, fell to `0`, and won over
	// the shorthand in the same rule. Resolving here means an unset edge
	// simply stays unset.
	const insetAll = resolveSize(props.inset)
	const insetX = resolveSize(props.insetX)
	const insetY = resolveSize(props.insetY)

	const paddingAll = resolveBoxSpacing(props.padding)
	const paddingX = resolveBoxSpacing(props.paddingX)
	const paddingY = resolveBoxSpacing(props.paddingY)
	set('--z-box-padding-top', resolveBoxSpacing(props.paddingTop) ?? paddingY ?? paddingAll ?? insetY ?? insetAll)
	set('--z-box-padding-bottom', resolveBoxSpacing(props.paddingBottom) ?? paddingY ?? paddingAll ?? insetY ?? insetAll)
	set('--z-box-padding-left', resolveBoxSpacing(props.paddingLeft) ?? paddingX ?? paddingAll ?? insetX ?? insetAll)
	set('--z-box-padding-right', resolveBoxSpacing(props.paddingRight) ?? paddingX ?? paddingAll ?? insetX ?? insetAll)

	const marginAll = resolveBoxSpacing(props.margin)
	const marginX = resolveBoxSpacing(props.marginX)
	const marginY = resolveBoxSpacing(props.marginY)
	set('--z-box-margin-top', resolveBoxSpacing(props.marginTop) ?? marginY ?? marginAll)
	set('--z-box-margin-bottom', resolveBoxSpacing(props.marginBottom) ?? marginY ?? marginAll)
	set('--z-box-margin-left', resolveBoxSpacing(props.marginLeft) ?? marginX ?? marginAll)
	set('--z-box-margin-right', resolveBoxSpacing(props.marginRight) ?? marginX ?? marginAll)

	set('--z-box-grid-template-columns', resolveGridTemplateValue(props.columns))
	set('--z-box-grid-template-rows', resolveGridTemplateValue(props.rows))
	set('--z-box-small-grid-template-columns', resolveGridTemplateValue(props.smallColumns))
	set('--z-box-medium-grid-template-columns', resolveGridTemplateValue(props.mediumColumns))
	set('--z-box-large-grid-template-columns', resolveGridTemplateValue(props.largeColumns))
	set('--z-box-extra-large-grid-template-columns', resolveGridTemplateValue(props.extraLargeColumns))

	set('--z-box-gap', resolveBoxSpacing(props.gap))
	set('--z-box-row-gap', resolveBoxSpacing(props.rowGap))
	set('--z-box-column-gap', resolveBoxSpacing(props.columnGap))

	set('--z-box-width', resolveLengthValue(props.width))
	set('--z-box-min-width', resolveLengthValue(props.minWidth))
	set('--z-box-max-width', resolveLengthValue(props.maxWidth))
	set('--z-box-height', resolveLengthValue(props.height))
	set('--z-box-min-height', resolveLengthValue(props.minHeight))
	set('--z-box-max-height', resolveLengthValue(props.maxHeight))

	// aligns-x is always horizontal and aligns-y always vertical, so which one
	// drives the main axis flips with the flow direction.
	const isHorizontal = props.direction !== 'vertical'
	const mainAxisAlign = isHorizontal ? props.alignsX : props.alignsY
	const crossAxisAlign = isHorizontal ? props.alignsY : props.alignsX

	set('--z-box-justify', resolveJustify(mainAxisAlign))
	set('--z-box-align', resolveAlign(crossAxisAlign))

	return style
}
