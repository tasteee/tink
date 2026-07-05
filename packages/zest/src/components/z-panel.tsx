import { c, css, useHost, useEffect } from 'atomico'

/*
 * z-panel — a single pane inside z-resizable-panels. Mostly declarative: the group
 * reads its size attributes (default-size / min-size / max-size, all accepting
 * `%` or `px`) and drives its flex-basis. It exposes an imperative API that
 * delegates back to the group, so `panel.collapse()` / `.expand()` / `.resize()`
 * / `.getSize()` / `.isCollapsed()` work off the DOM node.
 *
 * Events are dispatched by the group *onto* the panel (not declared as Atomico
 * props here, to avoid colliding with the same-named imperative methods):
 *   • `collapsechange` → { collapsed: boolean }
 *   • `sizechange`     → { size: number }   (percentage)
 * The `is-collapsed` attribute is toggled by the group so you can style the
 * collapsed state (e.g. hide overflowing content).
 *
 *   min-size == max-size ⇒ a fixed-size panel.
 */
const styles = css`
	:host {
		display: block;
		position: relative;
		min-width: 0;
		min-height: 0;
	}
	:host([is-collapsed]) {
		overflow: hidden;
	}
`

export const ZPanel = c(
	(props) => {
		const host = useHost()

		useEffect(() => {
			const el = host.current as any
			const group = () => (host.current as HTMLElement).parentElement as any
			const index = () => group()?.__panelIndex?.(host.current) ?? -1

			el.collapse = () => group()?.__collapsePanel?.(index())
			el.expand = () => group()?.__expandPanel?.(index())
			el.resize = (size: number) => {
				const g = group()
				if (!g) return
				const i = index()
				const cur = g.getLayout()[i] ?? 0
				// translate a target % into a boundary delta on this panel's trailing handle
				g.__resizeAt(i, ((size - cur) / 100) * g.__extent())
			}
			el.getSize = () => {
				const g = group()
				return g ? g.getLayout()[index()] ?? 0 : 0
			}
			el.isCollapsed = () => (host.current as HTMLElement).hasAttribute('is-collapsed')
		}, [])

		return (
			<host shadowDom>
				<slot />
			</host>
		)
	},
	{
		props: {
			defaultSize: { type: String, reflect: true },
			minSize: { type: String, reflect: true },
			maxSize: { type: String, reflect: true },
			collapsible: { type: Boolean, reflect: true },
			collapsedSize: { type: String, reflect: true },
			collapseThreshold: { type: String, reflect: true },
			order: { type: Number, reflect: true }
		},
		styles
	}
)

customElements.define('z-panel', ZPanel)
