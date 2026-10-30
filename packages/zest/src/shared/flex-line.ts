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
		padding-left: var(${prefix}-pad-left, 0);
		padding-right: var(${prefix}-pad-right, 0);
		margin-top: var(${prefix}-margin-top, 0);
		margin-bottom: var(${prefix}-margin-bottom, 0);
		margin-left: var(${prefix}-margin-left, 0);
		margin-right: var(${prefix}-margin-right, 0);
	}

	:host([wrap]) {
		flex-wrap: wrap;
	}

	:host([full-width]) {
		width: 100%;
	}

	:host([full-height]) {
		height: 100%;
	}
`

// one rule per breakpoint: below it, the row turns into a column
export const stackBelowStyles = (prefix: string) => css`
	${Object.entries(BREAKPOINTS)
		.map(
			([name, width]) => `
		@media (max-width: calc(${width} - 0.02px)) {
			:host([stack-below='${name}']) {
				flex-direction: column;
				flex-wrap: nowrap;
				justify-content: var(${prefix}-stacked-justify, flex-start);
				align-items: var(${prefix}-stacked-align, stretch);
			}
		}`
		)
		.join('\n')}
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
