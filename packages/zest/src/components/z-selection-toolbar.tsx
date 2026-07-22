import { c, css, event, useHost, useRef, useEffect } from 'atomico'
import { floatingSurfaceStyles, floatingToolbarStyles, floatingIconButtonStyles } from '../shared/editor-overlay-styles'
import { computePosition, autoUpdate, rectAnchor, AnyProp, type Placement } from '../shared/overlay'
import { useVisibilityPhase } from '../shared/transition'

/*
 * z-selection-toolbar — a floating formatting strip that appears above a text
 * selection. Place one instance on the page (a singleton, same shape as
 * z-toast); drive it from your selectionchange handler:
 *   const bar = document.querySelector('z-selection-toolbar')
 *   bar.items = [{ value: 'bold', icon, isActive: true }, ...]
 *   bar.anchorRect = range.getBoundingClientRect()
 *   bar.isOpen = !selection.isCollapsed
 * The panel's own mousedown is prevented by default so clicking a button never
 * collapses the live selection first — the browser would otherwise move focus
 * and clear it before the click handler runs. Fires `action` with { value }.
 */
const styles = css`
	:host {
		position: fixed;
		inset: 0;
		z-index: var(--z-toolbar, 40);
		pointer-events: none;
	}
`

type ToolbarItemT = {
	value?: string
	label?: string
	icon?: string
	isActive?: boolean
	isDisabled?: boolean
}

export const ZSelectionToolbar = c(
	(props) => {
		const host = useHost()
		const floatRef = useRef<HTMLDivElement>()
		const isOpen = Boolean(props.isOpen)
		const phase = useVisibilityPhase(isOpen)
		const items: ToolbarItemT[] = Array.isArray(props.items) ? (props.items as ToolbarItemT[]) : []

		useEffect(() => {
			const floating = floatRef.current
			if (!floating || !isOpen || !props.anchorRect) return
			const anchor = rectAnchor(props.anchorRect as { x: number; y: number; width: number; height: number })
			const update = () =>
				computePosition(anchor, floating, { placement: (props.placement as Placement) || 'top', offset: props.offset ?? 10 })

			const applyAndUpdate = () => {
				const pos = update()
				floating.style.left = `${pos.x}px`
				floating.style.top = `${pos.y}px`
			}

			return autoUpdate(anchor, floating, applyAndUpdate)
		}, [isOpen, props.anchorRect, props.placement, props.offset])

		const commit = (item: ToolbarItemT) => {
			if (item.isDisabled) return
			props.action({ value: item.value || item.label || '' })
		}

		const surfaceClass = ['surface'].concat(phase === 'open' ? ['is-open'] : []).concat(phase === 'closing' ? ['is-closing'] : []).join(' ')

		if (phase === 'closed' && !isOpen) return <host shadowDom></host>

		return (
			<host shadowDom>
				<div
					ref={floatRef}
					class={surfaceClass}
					role="toolbar"
					aria-label={props.label || 'Selection formatting'}
					onmousedown={(mouseEvent: MouseEvent) => mouseEvent.preventDefault()}
				>
					{items.map((item, index) => {
						const buttonClass = ['icon-button'].concat(item.isActive ? ['is-active'] : []).join(' ')
						return (
							<button
								key={item.value || index}
								type="button"
								class={buttonClass}
								aria-label={item.label || item.value}
								aria-pressed={item.isActive ? 'true' : 'false'}
								disabled={item.isDisabled}
								onclick={() => commit(item)}
							>
								{item.icon ? <span innerHTML={item.icon} /> : item.label}
							</button>
						)
					})}
				</div>
			</host>
		)
	},
	{
		props: {
			items: { type: Array },
			anchorRect: AnyProp,
			placement: { type: String, reflect: true },
			offset: { type: Number },
			label: String,
			isOpen: { type: Boolean, reflect: true },
			action: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles: [floatingSurfaceStyles, floatingToolbarStyles, floatingIconButtonStyles, styles]
	}
)

customElements.define('z-selection-toolbar', ZSelectionToolbar)
