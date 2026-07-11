import { c, css } from 'atomico'
import { baseStyles, coerceSize, insetProps, resolveAlign, resolveJustify, sizeProp } from '../shared/layout-schema'

/*
 * z-column — a simple vertical flex container with spacing and alignment APIs.
 * It accepts native element attributes like id/class/role and adds layout props
 * for gap, padding, margin, aligns-x, and aligns-y.
 */
const styles = css`
	:host {
		display: flex;
		flex-direction: column;
		gap: var(--z-column-gap, 0);
		justify-content: var(--z-column-justify, flex-start);
		align-items: var(--z-column-align, stretch);
		padding-top: var(--z-column-pad-top, 0);
		padding-bottom: var(--z-column-pad-bottom, 0);
		padding-left: var(--z-column-pad-left, 0);
		padding-right: var(--z-column-pad-right, 0);
		margin-top: var(--z-column-margin-top, 0);
		margin-bottom: var(--z-column-margin-bottom, 0);
		margin-left: var(--z-column-margin-left, 0);
		margin-right: var(--z-column-margin-right, 0);
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

type ZColumnPropsT = {
	gap?: string | number
	padding?: string | number
	margin?: string | number
	alignsX?: string
	alignsY?: string
}

const getHostStyle = (props: ZColumnPropsT): Record<string, string> => {
	const style: Record<string, string> = {}
	const gap = coerceSize(props.gap)
	const padding = coerceSize(props.padding)
	const margin = coerceSize(props.margin)
	const justify = resolveJustify(props.alignsY)
	const align = resolveAlign(props.alignsX)

	if (gap) style['--z-column-gap'] = gap
	if (padding) {
		style['--z-column-pad-top'] = padding
		style['--z-column-pad-bottom'] = padding
		style['--z-column-pad-left'] = padding
		style['--z-column-pad-right'] = padding
	}
	if (margin) {
		style['--z-column-margin-top'] = margin
		style['--z-column-margin-bottom'] = margin
		style['--z-column-margin-left'] = margin
		style['--z-column-margin-right'] = margin
	}
	if (justify) style['--z-column-justify'] = justify
	if (align) style['--z-column-align'] = align
	return style
}

export const ZColumn = c(
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

customElements.define('z-column', ZColumn)
