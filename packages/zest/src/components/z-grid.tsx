import { c, css } from 'atomico'
import { baseStyles, insetProps, insetVars, resolveGridAlign, resolveSize } from '../shared/layout-schema'

/*
 * z-grid — a CSS grid primitive. Use `columns` for a fixed count or
 * `min-column-width` for a responsive auto-fit grid (the latter wins when both
 * are set). `aligns-x` / `aligns-y` align items within their cells.
 */
const styles = css`
	:host {
		display: grid;
		gap: var(--z-grid-gap, 0);
		row-gap: var(--z-grid-row-gap, var(--z-grid-gap, 0));
		column-gap: var(--z-grid-column-gap, var(--z-grid-gap, 0));
		grid-template-columns: var(--z-grid-columns, none);
		justify-items: var(--z-grid-justify, stretch);
		align-items: var(--z-grid-align, stretch);
		padding-top: var(--z-grid-pad-top, 0);
		padding-bottom: var(--z-grid-pad-bottom, 0);
		padding-left: var(--z-grid-pad-left, 0);
		padding-right: var(--z-grid-pad-right, 0);
	}

	:host([full-width]) {
		width: 100%;
	}
`

const getHostStyle = (props: {
	columns?: string
	minColumnWidth?: string
	gap?: string
	gapX?: string
	gapY?: string
	alignsX?: string
	alignsY?: string
} & Parameters<typeof insetVars>[0]): Record<string, string> => {
	const style: Record<string, string> = { ...insetVars(props, '--z-grid') }

	if (props.minColumnWidth) {
		style['--z-grid-columns'] = `repeat(auto-fit, minmax(${props.minColumnWidth}, 1fr))`
	} else if (props.columns) {
		style['--z-grid-columns'] = `repeat(${props.columns}, minmax(0, 1fr))`
	}

	const gap = resolveSize(props.gap)
	const gapX = resolveSize(props.gapX)
	const gapY = resolveSize(props.gapY)
	if (gap) style['--z-grid-gap'] = gap
	if (gapX) style['--z-grid-column-gap'] = gapX
	if (gapY) style['--z-grid-row-gap'] = gapY

	const justify = resolveGridAlign(props.alignsX)
	const align = resolveGridAlign(props.alignsY)
	if (justify) style['--z-grid-justify'] = justify
	if (align) style['--z-grid-align'] = align
	return style
}

export const ZGrid = c(
	(props) => (
		<host shadowDom style={getHostStyle(props)}>
			<slot />
		</host>
	),
	{
		props: {
			columns: String,
			minColumnWidth: String,
			gap: String,
			gapX: String,
			gapY: String,
			alignsX: String,
			alignsY: String,
			fullWidth: { type: Boolean, reflect: true },
			...insetProps
		},
		styles: [baseStyles, styles]
	}
)

customElements.define('z-grid', ZGrid)
