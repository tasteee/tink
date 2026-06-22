import { c, css } from 'atomico'
import { baseStyles, resolveSize, resolveWidth } from '../shared/layout-schema'

/*
 * z-container — a centered, max-width page/content wrapper with horizontal
 * gutters. `size` sets the max width (token or any CSS length, default xl),
 * `gutter` the side padding. Centered by default.
 */
const styles = css`
	:host {
		display: block;
		width: 100%;
		max-width: var(--z-container-size, 80rem);
		margin-left: auto;
		margin-right: auto;
		padding-left: var(--z-container-gutter, 0);
		padding-right: var(--z-container-gutter, 0);
	}

	:host([full-height]) {
		min-height: 100%;
	}
`

const getHostStyle = (props: { size?: string; gutter?: string }): Record<string, string> => {
	const style: Record<string, string> = {}
	const size = resolveWidth(props.size)
	const gutter = resolveSize(props.gutter)
	if (size) style['--z-container-size'] = size
	if (gutter) style['--z-container-gutter'] = gutter
	return style
}

export const ZContainer = c(
	(props) => (
		<host shadowDom style={getHostStyle(props)}>
			<slot />
		</host>
	),
	{
		props: {
			size: String,
			gutter: String,
			// Centered by default; declared for API completeness.
			center: { type: Boolean, reflect: true },
			fullHeight: { type: Boolean, reflect: true }
		},
		styles: [baseStyles, styles]
	}
)

customElements.define('z-container', ZContainer)
