import { c, css } from 'atomico'
import { baseStyles, resolveSize, resolveWidth } from '../shared/layout-schema'

/*
 * z-section — a vertical page band. `space` is the top/bottom padding
 * (`space-top` / `space-bottom` override per edge). Optionally folds in
 * z-container behaviour: set `container` to a width and the slotted content is
 * centered to that max-width with `gutter` side padding, so
 *   <z-section container="xl" gutter="lg">
 * replaces a nested <z-section><z-container size="xl" gutter="lg">.
 */
const styles = css`
	:host {
		display: block;
		padding-top: var(--z-section-space-top, 0);
		padding-bottom: var(--z-section-space-bottom, 0);
	}

	.inner {
		box-sizing: border-box;
		width: 100%;
		max-width: var(--z-section-container, none);
		margin-left: auto;
		margin-right: auto;
		padding-left: var(--z-section-gutter, 0);
		padding-right: var(--z-section-gutter, 0);
	}
`

const getHostStyle = (props: {
	space?: string
	spaceTop?: string
	spaceBottom?: string
	container?: string
	gutter?: string
}): Record<string, string> => {
	const style: Record<string, string> = {}
	const all = resolveSize(props.space)
	const top = resolveSize(props.spaceTop) ?? all
	const bottom = resolveSize(props.spaceBottom) ?? all
	if (top) style['--z-section-space-top'] = top
	if (bottom) style['--z-section-space-bottom'] = bottom

	const container = resolveWidth(props.container)
	const gutter = resolveSize(props.gutter)
	if (container) style['--z-section-container'] = container
	if (gutter) style['--z-section-gutter'] = gutter
	return style
}

export const ZSection = c(
	(props) => (
		<host shadowDom style={getHostStyle(props)}>
			<div class='inner'>
				<slot />
			</div>
		</host>
	),
	{
		props: {
			space: String,
			spaceTop: String,
			spaceBottom: String,
			container: String,
			gutter: String
		},
		styles: [baseStyles, styles]
	}
)

customElements.define('z-section', ZSection)
