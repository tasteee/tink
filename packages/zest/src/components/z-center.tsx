import { c, css } from 'atomico'
import { baseStyles, insetProps, insetVars, resolveEdge, resolveWidth } from '../shared/layout-schema'

/*
 * z-center — centers its content on both axes by default. `aligns-x` /
 * `aligns-y` override either axis (start / center / end), `both` forces dead
 * center, `max-width` constrains the inner content block, `text` centers text,
 * and `min-height` is handy for full-viewport hero centering ("100dvh").
 */
const styles = css`
	:host {
		display: flex;
		justify-content: var(--z-center-justify, center);
		align-items: var(--z-center-align, center);
		min-height: var(--z-center-min-height, auto);
		padding-top: var(--z-center-pad-top, 0);
		padding-bottom: var(--z-center-pad-bottom, 0);
		padding-left: var(--z-center-pad-left, 0);
		padding-right: var(--z-center-pad-right, 0);
	}

	:host([text]) {
		text-align: center;
	}

	:host([full-width]) {
		width: 100%;
	}

	:host([full-height]) {
		height: 100%;
	}

	.inner {
		max-width: var(--z-center-max-width, none);
	}

	:host([full-width]) .inner {
		width: 100%;
	}
`

const getHostStyle = (props: {
	alignsX?: string
	alignsY?: string
	both?: boolean
	maxWidth?: string
	minHeight?: string
} & Parameters<typeof insetVars>[0]): Record<string, string> => {
	const style: Record<string, string> = { ...insetVars(props, '--z-center') }

	const justify = props.both ? 'center' : resolveEdge(props.alignsX)
	const align = props.both ? 'center' : resolveEdge(props.alignsY)
	if (justify) style['--z-center-justify'] = justify
	if (align) style['--z-center-align'] = align

	const maxWidth = resolveWidth(props.maxWidth)
	if (maxWidth) style['--z-center-max-width'] = maxWidth
	if (props.minHeight) style['--z-center-min-height'] = props.minHeight
	return style
}

export const ZCenter = c(
	(props) => (
		<host shadowDom style={getHostStyle(props)}>
			<div class='inner'>
				<slot />
			</div>
		</host>
	),
	{
		props: {
			alignsX: String,
			alignsY: String,
			both: { type: Boolean, reflect: true },
			maxWidth: String,
			text: { type: Boolean, reflect: true },
			minHeight: String,
			fullWidth: { type: Boolean, reflect: true },
			fullHeight: { type: Boolean, reflect: true },
			...insetProps
		},
		styles: [baseStyles, styles]
	}
)

customElements.define('z-center', ZCenter)
