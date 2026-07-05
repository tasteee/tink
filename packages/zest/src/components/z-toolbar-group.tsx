import { c, css } from 'atomico'

/*
 * z-toolbar-group — a labeled cluster of related controls inside a z-toolbar.
 * Keeps its buttons visually tight and exposes an accessible group name.
 *
 *   <z-toolbar>
 *     <z-toolbar-group label="Text style">
 *       <z-button kind="ghost">B</z-button>
 *       <z-button kind="ghost">I</z-button>
 *     </z-toolbar-group>
 *   </z-toolbar>
 */
const styles = css`
	:host {
		display: inline-flex;
		align-items: center;
		gap: 0.125rem;
	}
	:host([is-hidden]) {
		display: none;
	}
`

export const ZToolbarGroup = c(
	(props) => {
		return (
			<host shadowDom role='group' aria-label={props.label}>
				<slot />
			</host>
		)
	},
	{
		props: {
			label: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-toolbar-group', ZToolbarGroup)
