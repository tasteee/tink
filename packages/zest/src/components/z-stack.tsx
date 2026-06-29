import { c, css } from 'atomico'
import { baseStyles, insetProps, insetVars, resolveAlign, resolveJustify, resolveSize } from '../shared/layout-schema'

/*
 * z-stack — one-dimensional flex layout. `direction` picks the axis
 * (vertical = column, the default; horizontal = row). Alignment uses the
 * axis-based model: `aligns-x` is the horizontal relationship and `aligns-y`
 * the vertical one, regardless of direction — internally they map onto
 * justify-content / align-items depending on the flow axis.
 */
const styles = css`
	:host {
		display: flex;
		flex-direction: column;
		gap: var(--z-stack-gap, 0);
		justify-content: var(--z-stack-justify, flex-start);
		align-items: var(--z-stack-align, stretch);
		padding-top: var(--z-stack-pad-top, 0);
		padding-bottom: var(--z-stack-pad-bottom, 0);
		padding-left: var(--z-stack-pad-left, 0);
		padding-right: var(--z-stack-pad-right, 0);
	}

	:host([direction='horizontal']) {
		flex-direction: row;
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

const getHostStyle = (props: {
	direction?: string
	gap?: string
	alignsX?: string
	alignsY?: string
} & Parameters<typeof insetVars>[0]): Record<string, string> => {
	const isRow = props.direction === 'horizontal'
	const main = isRow ? props.alignsX : props.alignsY
	const cross = isRow ? props.alignsY : props.alignsX

	const style: Record<string, string> = { ...insetVars(props, '--z-stack') }
	const gap = resolveSize(props.gap)
	const justify = resolveJustify(main)
	const align = resolveAlign(cross)
	if (gap) style['--z-stack-gap'] = gap
	if (justify) style['--z-stack-justify'] = justify
	if (align) style['--z-stack-align'] = align
	return style
}

export const ZStack = c(
	(props) => (
		<host shadowDom style={getHostStyle(props)}>
			<slot />
		</host>
	),
	{
		props: {
			direction: { type: String, reflect: true },
			gap: String,
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

customElements.define('z-stack', ZStack)
