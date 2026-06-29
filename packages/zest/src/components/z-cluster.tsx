import { c, css } from 'atomico'
import { baseStyles, insetProps, insetVars, resolveAlign, resolveJustify, resolveSize } from '../shared/layout-schema'

/*
 * z-cluster — a horizontal, wrapping row for actions, tags, nav items, badges.
 * Always flows as a row and wraps by default; set `wrap` to false to keep it on
 * a single line. `aligns-x` distributes along the row, `aligns-y` aligns the
 * cross axis.
 */
const styles = css`
	:host {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: var(--z-cluster-gap, var(--spacing-2));
		justify-content: var(--z-cluster-justify, flex-start);
		align-items: var(--z-cluster-align, center);
		padding-top: var(--z-cluster-pad-top, 0);
		padding-bottom: var(--z-cluster-pad-bottom, 0);
		padding-left: var(--z-cluster-pad-left, 0);
		padding-right: var(--z-cluster-pad-right, 0);
	}

	:host([wrap='false']) {
		flex-wrap: nowrap;
	}

	:host([full-width]) {
		width: 100%;
	}
`

const getHostStyle = (props: {
	gap?: string
	alignsX?: string
	alignsY?: string
} & Parameters<typeof insetVars>[0]): Record<string, string> => {
	const style: Record<string, string> = { ...insetVars(props, '--z-cluster') }
	const gap = resolveSize(props.gap)
	const justify = resolveJustify(props.alignsX)
	const align = resolveAlign(props.alignsY)
	if (gap) style['--z-cluster-gap'] = gap
	if (justify) style['--z-cluster-justify'] = justify
	if (align) style['--z-cluster-align'] = align
	return style
}

export const ZCluster = c(
	(props) => (
		<host shadowDom style={getHostStyle(props)}>
			<slot />
		</host>
	),
	{
		props: {
			gap: String,
			alignsX: String,
			alignsY: String,
			// Wraps by default (a boolean can't express the off state since false
			// reads the same as absent). Pass wrap="false" to keep on one line.
			wrap: { type: String, reflect: true },
			fullWidth: { type: Boolean, reflect: true },
			...insetProps
		},
		styles: [baseStyles, styles]
	}
)

customElements.define('z-cluster', ZCluster)
