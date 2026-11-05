import { defineElement } from '../shared/define-element'
import { c } from 'atomico'
import { baseStyles, insetProps, sizeProp } from '../shared/layout-schema'
import { flexLineStyles, flexLineVars, stackBelowStyles } from '../shared/flex-line'
import { oneOf } from '../shared/prop-types'

/*
 * z-row, a horizontal flex line with spacing and the axis-based alignment
 * model (`aligns-x` along the row, `aligns-y` across it). `does-wrap` lets items
 * flow onto new lines, for tag lists, action groups, and toolbars that need
 * to reflow. `stack-below="small|medium|large|extra-large"` turns it into a
 * column under that breakpoint, e.g. side-by-side fields that stack on phones.
 */
export const ZRow = c(
	(props) => (
		<host shadowDom style={flexLineVars(props, '--z-row', 'row')}>
			<slot />
		</host>
	),
	{
		props: {
			gap: sizeProp,
			padding: sizeProp,
			margin: sizeProp,
			alignsX: { type: oneOf('start', 'center', 'end', 'between', 'around', 'evenly', 'stretch') },
			alignsY: { type: oneOf('start', 'center', 'end', 'between', 'around', 'evenly', 'stretch') },
			doesWrap: { type: Boolean, reflect: true },
			stackBelow: { type: oneOf('small', 'medium', 'large', 'extra-large'), reflect: true },
			isFullWidth: { type: Boolean, reflect: true },
			isFullHeight: { type: Boolean, reflect: true },
			...insetProps
		},
		styles: [baseStyles, flexLineStyles('--z-row', 'row'), stackBelowStyles('--z-row')]
	}
)

defineElement('z-row', ZRow)
