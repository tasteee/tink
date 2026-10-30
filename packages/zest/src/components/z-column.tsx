import { c } from 'atomico'
import { baseStyles, insetProps, sizeProp } from '../shared/layout-schema'
import { flexLineStyles, flexLineVars } from '../shared/flex-line'

/*
 * z-column, a vertical flex line with spacing and the axis-based alignment
 * model (`aligns-y` along the column, `aligns-x` across it). The default
 * vertical stack for reading groups, forms, and panels.
 */
export const ZColumn = c(
	(props) => (
		<host shadowDom style={flexLineVars(props, '--z-column', 'column')}>
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
		styles: [baseStyles, flexLineStyles('--z-column', 'column')]
	}
)

customElements.define('z-column', ZColumn)
