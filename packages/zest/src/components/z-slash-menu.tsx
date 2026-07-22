import { c, css, event, useHost, useRef, useState, useEffect } from 'atomico'
import { floatingSurfaceStyles, floatingMenuStyles, floatingMenuItemStyles } from '../shared/editor-overlay-styles'
import { computePosition, autoUpdate, rectAnchor, AnyProp, type Placement } from '../shared/overlay'
import { useVisibilityPhase } from '../shared/transition'
import { createLiveQueryMenuKeyDownHandler } from '../shared/menu-nav'

/*
 * z-slash-menu — the "/" command menu. This component is purely presentational
 * and editor-agnostic: it does not watch your contenteditable for "/" or own
 * the raw "/query" text in the document — that's the host editor's job. Drive
 * it from your own input handling:
 *   const menu = document.querySelector('z-slash-menu')
 *   menu.items = [{ value: 'h1', label: 'Heading 1', icon, description }, ...]
 *   menu.query = 'hea'          // the text typed after "/", filters live
 *   menu.anchorRect = caretRect // e.g. from a Range at the "/" position
 *   menu.isOpen = true
 * Listen for `empty` to know when the live query has no matches — the
 * canonical "bail on space with no match" behavior is: on seeing a space
 * keydown in your editor while the menu reports empty, delete the "/query"
 * text yourself and set isOpen = false. On `select`, delete the "/query" text
 * and insert whatever the chosen item represents. Esc fires `dismiss`.
 */
const styles = css`
	:host {
		position: fixed;
		inset: 0;
		z-index: var(--z-menu, 50);
		pointer-events: none;
	}
`

type SlashItemT = {
	value?: string
	label?: string
	icon?: string
	description?: string
	isDisabled?: boolean
}

export const ZSlashMenu = c(
	(props) => {
		const host = useHost()
		const floatRef = useRef<HTMLDivElement>()
		const isOpen = Boolean(props.isOpen)
		const phase = useVisibilityPhase(isOpen)
		const [activeIndex, setActiveIndex] = useState(0)

		const items: SlashItemT[] = Array.isArray(props.items) ? (props.items as SlashItemT[]) : []
		const query = String(props.query || '').trim().toLowerCase()
		const filtered = query ? items.filter((item) => `${item.label || ''} ${item.description || ''}`.toLowerCase().includes(query)) : items
		const selectable = (index: number) => Boolean(filtered[index] && !filtered[index].isDisabled)

		useEffect(() => {
			setActiveIndex(0)
		}, [props.query, props.items])

		useEffect(() => {
			if (filtered.length === 0 && query) props.empty()
		}, [filtered.length, query])

		useEffect(() => {
			const floating = floatRef.current
			if (!floating || !isOpen || !props.anchorRect) return
			const anchor = rectAnchor(props.anchorRect as { x: number; y: number; width: number; height: number })
			const update = () => {
				const pos = computePosition(anchor, floating, { placement: (props.placement as Placement) || 'bottom-start', offset: props.offset ?? 8 })
				floating.style.left = `${pos.x}px`
				floating.style.top = `${pos.y}px`
			}
			return autoUpdate(anchor, floating, update)
		}, [isOpen, props.anchorRect, props.placement, props.offset])

		const commit = (index: number) => {
			const item = filtered[index]
			if (!item || item.isDisabled) return
			props.select({ value: item.value || item.label || '' })
		}

		const onKeyDown = createLiveQueryMenuKeyDownHandler({
			itemCount: filtered.length,
			activeIndex,
			isSelectable: selectable,
			onMove: setActiveIndex,
			onCommit: commit,
			onClose: () => props.dismiss()
		})

		useEffect(() => {
			if (!isOpen) return
			// Space is never swallowed here — it's an ordinary character the host
			// document keeps typing. With no match it also bails: the host closes
			// the menu and leaves "/query " as plain text, deleting nothing.
			const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
				if (keyboardEvent.key === ' ' && filtered.length === 0) {
					props.dismiss()
					return
				}
				onKeyDown(keyboardEvent)
			}
			document.addEventListener('keydown', handleKeyDown, true)
			return () => document.removeEventListener('keydown', handleKeyDown, true)
		}, [isOpen, activeIndex, filtered.length, query])

		const surfaceClass = ['surface']
			.concat(phase === 'open' ? ['is-open'] : [])
			.concat(phase === 'closing' ? ['is-closing'] : [])
			.join(' ')

		if (phase === 'closed' && !isOpen) return <host shadowDom></host>

		const activeId = filtered[activeIndex] ? `slash-item-${filtered[activeIndex].value || activeIndex}` : undefined

		return (
			<host shadowDom>
				<div ref={floatRef} class={surfaceClass} role="listbox" aria-label="Slash commands" aria-activedescendant={activeId}>
					{filtered.length === 0 && <div class="empty">{props.emptyText || 'No matching commands'}</div>}
					{filtered.map((item, index) => {
						const itemClass = ['item']
							.concat(index === activeIndex ? ['is-active'] : [])
							.concat(item.isDisabled ? ['is-disabled'] : [])
							.join(' ')
						return (
							<button
								key={item.value || item.label || index}
								id={`slash-item-${item.value || index}`}
								type="button"
								class={itemClass}
								role="option"
								aria-selected={index === activeIndex ? 'true' : 'false'}
								disabled={item.isDisabled}
								onmouseenter={() => setActiveIndex(index)}
								onclick={() => commit(index)}
							>
								{item.icon && <span class="icon" innerHTML={item.icon} />}
								<span class="label">{item.label}</span>
								{item.description && <span class="description">{item.description}</span>}
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
			query: { type: String },
			anchorRect: AnyProp,
			placement: { type: String, reflect: true },
			offset: { type: Number },
			emptyText: String,
			isOpen: { type: Boolean, reflect: true },
			select: event<{ value: string }>({ bubbles: true, composed: true }),
			empty: event<void>({ bubbles: true, composed: true }),
			dismiss: event<void>({ bubbles: true, composed: true })
		},
		styles: [floatingSurfaceStyles, floatingMenuStyles, floatingMenuItemStyles, styles]
	}
)

customElements.define('z-slash-menu', ZSlashMenu)
