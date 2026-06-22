import { c, css } from 'atomico'
import { baseStyles, resolveSize } from '../shared/layout-schema'

/*
 * z-spacer — empty spacing inside a flex layout. Give it a fixed `size` (applied
 * to both axes so it works in a row or a column) or set `grow` to soak up the
 * remaining space, e.g. pushing trailing items to the end of a toolbar.
 */
const styles = css`
	:host {
		display: block;
		flex: none;
		width: var(--z-spacer-size, 0);
		height: var(--z-spacer-size, 0);
	}

	:host([grow]) {
		flex: 1 1 0;
		align-self: stretch;
		width: auto;
		height: auto;
	}
`

const getHostStyle = (props: { size?: string }): Record<string, string> => {
	const style: Record<string, string> = {}
	const size = resolveSize(props.size)
	if (size) style['--z-spacer-size'] = size
	return style
}

export const ZSpacer = c(
	(props) => <host shadowDom style={getHostStyle(props)} />,
	{
		props: {
			size: String,
			grow: { type: Boolean, reflect: true }
		},
		styles: [baseStyles, styles]
	}
)

customElements.define('z-spacer', ZSpacer)
