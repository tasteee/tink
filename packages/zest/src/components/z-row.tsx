import { c, css } from 'atomico'
import { baseStyles, coerceSize, insetProps, resolveAlign, resolveJustify, sizeProp } from '../shared/layout-schema'

/*
 * z-row — a simple horizontal flex container with spacing and alignment APIs.
 * It accepts native element attributes like id/class/role and adds layout props
 * for gap, padding, margin, aligns-x, and aligns-y.
 */
const styles = css`
	:host {
		display: flex;
		flex-direction: row;
		gap: var(--z-row-gap, 0);
		justify-content: var(--z-row-justify, flex-start);
		align-items: var(--z-row-align, stretch);
		padding-top: var(--z-row-pad-top, 0);
		padding-bottom: var(--z-row-pad-bottom, 0);
		padding-left: var(--z-row-pad-left, 0);
		padding-right: var(--z-row-pad-right, 0);
		margin-top: var(--z-row-margin-top, 0);
		margin-bottom: var(--z-row-margin-bottom, 0);
		margin-left: var(--z-row-margin-left, 0);
		margin-right: var(--z-row-margin-right, 0);
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

type ZRowPropsT = {
	gap?: string | number
	padding?: string | number
	margin?: string | number
	alignsX?: string
	alignsY?: string
}

const getHostStyle = (props: ZRowPropsT): Record<string, string> => {
	const style: Record<string, string> = {}
	const gap = coerceSize(props.gap)
	const padding = coerceSize(props.padding)
	const margin = coerceSize(props.margin)
	const justify = resolveJustify(props.alignsX)
	const align = resolveAlign(props.alignsY)

	if (gap) style['--z-row-gap'] = gap
	if (padding) {
		style['--z-row-pad-top'] = padding
		style['--z-row-pad-bottom'] = padding
		style['--z-row-pad-left'] = padding
		style['--z-row-pad-right'] = padding
	}
	if (margin) {
		style['--z-row-margin-top'] = margin
		style['--z-row-margin-bottom'] = margin
		style['--z-row-margin-left'] = margin
		style['--z-row-margin-right'] = margin
	}
	if (justify) style['--z-row-justify'] = justify
	if (align) style['--z-row-align'] = align
	return style
}

export const ZRow = c(
	(props) => (
		<host shadowDom style={getHostStyle(props)}>
			<slot />
		</host>
	),
	{
		props: {
			gap: sizeProp,
			padding: sizeProp,
			margin: sizeProp,
			alignsX: String,
			alignsY: String,
			wrap: { type: Boolean, reflect: true },
			fullWidth: { type: Boolean, reflect: true },
			fullHeight: { type: Boolean, reflect: true },
			...insetProps
		},
		styles: [baseStyles, styles]
	}
)

customElements.define('z-row', ZRow)
