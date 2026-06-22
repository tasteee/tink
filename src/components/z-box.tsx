import { c, css } from 'atomico'
import { boxProps, getBoxHostStyle } from '../shared/box-schema'
import { boxLayoutStyles } from '../shared/box-styles'

const baseStyles = css`
	:host {
		box-sizing: border-box;
	}
`

export const ZBox = c(
	(props) => (
		<host shadowDom style={getBoxHostStyle(props)}>
			<slot />
		</host>
	),
	{
		props: boxProps,
		styles: [baseStyles, boxLayoutStyles]
	}
)

customElements.define('z-box', ZBox)
