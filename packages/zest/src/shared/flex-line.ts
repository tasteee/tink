import { css } from 'atomico'
import { coerceSize, insetVars, resolveAlign, resolveJustify } from './layout-schema'

/*
 * The shared engine behind z-row and z-column: a one-axis flex line with the
 * axis-based alignment model. `aligns-x` is always the horizontal relationship
 * and `aligns-y` the vertical one, whichever way the line flows; here they're
 * mapped onto justify-content / align-items for the current axis.
 *
 * z-row can also `stack-below` a breakpoint (small 40rem, medium 48rem, large
 * 64rem, extra-large 80rem, the same names as z-box's responsive columns):
 * under that viewport width it flows as a column, with aligns-x / aligns-y
 * keeping their meaning on the new axis.
 */

export type FlexLinePropsT = {
	gap?: string | number
	padding?: string | number
	margin?: string | number
	alignsX?: string
	alignsY?: string
	inset?: string
	insetX?: string
	insetY?: string
}

const BREAKPOINTS: Record<string, string> = {
	small: '40rem',
	medium: '48rem',
	large: '64rem',
	'extra-large': '80rem'
}

const sides = ['top', 'bottom', 'left', 'right'] as const

export const flexLineStyles = (prefix: string, direction: 'row' | 'column') => css`
	:host {
		display: flex;
		flex-direction: ${direction};
		gap: var(${prefix}-gap, 0);
		justify-content: var(${prefix}-justify, flex-start);
		align-items: var(${prefix}-align, stretch);
		padding-top: var(${prefix}-pad-top, 0);
		padding-bottom: var(${prefix}-pad-bottom, 0);
		padding-inline-start: var(${prefix}-pad-left, 0);
		padding-inline-end: var(${prefix}-pad-right, 0);
		margin-top: var(${prefix}-margin-top, 0);
		margin-bottom: var(${prefix}-margin-bottom, 0);
		margin-inline-start: var(${prefix}-margin-left, 0);
		margin-inline-end: var(${prefix}-margin-right, 0);
	}

	:host([does-wrap]) {
		flex-wrap: wrap;
	}

	:host([is-full-width]) {
		width: 100%;
	}

	:host([is-full-height]) {
		height: 100%;
	}
`

// One rule per breakpoint: below it, the row turns into a column.
// Built as a plain string so the css template holds no nested
// template literal.
const buildStackBelowRule = (prefix: string, name: string, width: string): string => {
	const query = '@media (max-width: calc(' + width + ' - 0.02px))'
	const selector = ":host([stack-below='" + name + "'])"
	const justify = 'justify-content: var(' + prefix + '-stacked-justify, flex-start);'
	const align = 'align-items: var(' + prefix + '-stacked-align, stretch);'
	return query + ' { ' + selector + ' { flex-direction: column; flex-wrap: nowrap; ' + justify + ' ' + align + ' } }'
}

const buildStackBelowRules = (prefix: string): string => {
	const breakpoints = Object.entries(BREAKPOINTS)
	const rules = breakpoints.map((entry) => buildStackBelowRule(prefix, entry[0], entry[1]))
	return rules.join('\n')
}

export const stackBelowStyles = (prefix: string) => css`
	${buildStackBelowRules(prefix)}
`

export const flexLineVars = (
	props: FlexLinePropsT,
	prefix: string,
	direction: 'row' | 'column'
): Record<string, string> => {
	// inset is the token-scale padding; an explicit padding wins over it
	const style: Record<string, string> = { ...insetVars(props, prefix) }
	const gap = coerceSize(props.gap)
	const padding = coerceSize(props.padding)
	const margin = coerceSize(props.margin)
	const main = direction === 'row' ? props.alignsX : props.alignsY
	const cross = direction === 'row' ? props.alignsY : props.alignsX
	const justify = resolveJustify(main)
	const align = resolveAlign(cross)

	if (gap) style[`${prefix}-gap`] = gap
	if (padding) sides.forEach((side) => (style[`${prefix}-pad-${side}`] = padding))
	if (margin) sides.forEach((side) => (style[`${prefix}-margin-${side}`] = margin))
	if (justify) style[`${prefix}-justify`] = justify
	if (align) style[`${prefix}-align`] = align

	// the same intent, mapped for the opposite axis (used by stack-below)
	const stackedJustify = resolveJustify(cross)
	const stackedAlign = resolveAlign(main)
	if (stackedJustify) style[`${prefix}-stacked-justify`] = stackedJustify
	if (stackedAlign) style[`${prefix}-stacked-align`] = stackedAlign
	return style
}
