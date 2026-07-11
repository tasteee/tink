import { c, css } from 'atomico'
import {
	baseStyles,
	insetProps,
	insetVars,
	resolveAlign,
	resolveJustify,
	coerceSize,
	sizeProp
} from '../shared/layout-schema'

/*
 * z-cluster — a horizontal, wrapping row for actions, tags, nav items, badges.
 * Always flows as a row and wraps by default; set the `no-wrap` attribute to
 * keep it on a single line. `aligns-x` distributes along the row, `aligns-y`
 * aligns the cross axis.
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

	:host([no-wrap]) {
		flex-wrap: nowrap;
	}

	:host([full-width]) {
		width: 100%;
	}
`

const getHostStyle = (
	props: {
		gap?: string | number
		alignsX?: string
		alignsY?: string
	} & Parameters<typeof insetVars>[0]
): Record<string, string> => {
	const style: Record<string, string> = { ...insetVars(props, '--z-cluster') }

	const gap = coerceSize((props as any).gap)

	const justify = resolveJustify(props.alignsX)
	const align = resolveAlign(props.alignsY)
	if (gap) style['--z-cluster-gap'] = gap
	if (justify) style['--z-cluster-justify'] = justify
	if (align) style['--z-cluster-align'] = align
	return style
}

const renderer = (props: any) => {
	return (
		<host shadowDom style={getHostStyle(props)}>
			<slot />
		</host>
	)
}

export const ZCluster = c(renderer, {
	props: {
		gap: sizeProp,
		alignsX: String,
		alignsY: String,
		// Wraps by default. Set the `no-wrap` attribute to keep on one line.
		noWrap: { type: Boolean, reflect: true },
		fullWidth: { type: Boolean, reflect: true },
		...insetProps
	},
	styles: [baseStyles, styles]
})

customElements.define('z-cluster', ZCluster)
