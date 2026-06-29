import { c, css, useHost, useEffect } from 'atomico'

/*
 * z-accordion — wraps slotted <z-collapsible> items and draws hairline dividers
 * between them. type="single" (default) keeps at most one section open at a
 * time; type="multiple" lets several stay open. Coordination is done by
 * listening for the bubbling `toggle` event each z-collapsible fires, then
 * closing siblings as needed — the same parent/child pattern as
 * z-toggle-group / z-toggle-group-item.
 */
const styles = css`
	:host {
		display: block;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 0 var(--space-lg);
	}

	:host([is-hidden]) {
		display: none;
	}

	::slotted(z-collapsible:not(:first-child)) {
		border-top: 1px solid var(--border);
	}
`

export const ZAccordion = c(
	(props) => {
		const host = useHost()

		useEffect(() => {
			const el = host.current
			const onToggle = (e: Event) => {
				const detail = (e as CustomEvent).detail as { open: boolean }
				if (props.type === 'multiple') return
				if (!detail?.open) return
				const opened = e.target as Element
				const items = el.querySelectorAll('z-collapsible')
				items.forEach((item) => {
					if (item !== opened) (item as any).isOpen = false
				})
			}
			el.addEventListener('toggle', onToggle)
			return () => el.removeEventListener('toggle', onToggle)
		}, [props.type])

		return (
			<host shadowDom>
				<slot />
			</host>
		)
	},
	{
		props: {
			type: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-accordion', ZAccordion)
