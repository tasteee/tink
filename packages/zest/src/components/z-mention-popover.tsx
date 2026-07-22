import { c, css, event, useHost, useRef, useState, useEffect } from 'atomico'
import { floatingSurfaceStyles, floatingMenuStyles, floatingMenuItemStyles } from '../shared/editor-overlay-styles'
import { computePosition, autoUpdate, rectAnchor, AnyProp, type Placement } from '../shared/overlay'
import { useVisibilityPhase } from '../shared/transition'
import { createLiveQueryMenuKeyDownHandler } from '../shared/menu-nav'
import { debounce } from '../shared/debounce'

/*
 * z-mention-popover — the "@"/"#" mention & autocomplete popover. Presentational
 * and editor-agnostic, like z-slash-menu: it doesn't watch your contenteditable
 * for the trigger character, it just renders results for whatever `query` you
 * feed it.
 *   const mention = document.querySelector('z-mention-popover')
 *   mention.trigger = '@'
 *   mention.source = (query) => fetch(`/api/users?q=${query}`).then((r) => r.json())
 *   mention.query = 'sh'          // re-runs `source`, debounced
 *   mention.anchorRect = caretRect
 *   mention.isOpen = true
 * `source` is a JS property (a function), not an attribute — set it once, the
 * component debounces calls to it as `query` changes and shows a loading row
 * meanwhile. Without a `source`, it filters the static `items` array locally.
 * On `select`, replace the "@query" text with your resolved inline chip node.
 */
const styles = css`
	:host {
		position: fixed;
		inset: 0;
		z-index: var(--z-menu, 50);
		pointer-events: none;
	}
`

type MentionItemT = {
	value?: string
	label?: string
	icon?: string
	description?: string
	isDisabled?: boolean
}

export const ZMentionPopover = c(
	(props) => {
		const host = useHost()
		const floatRef = useRef<HTMLDivElement>()
		const isOpen = Boolean(props.isOpen)
		const phase = useVisibilityPhase(isOpen)
		const [activeIndex, setActiveIndex] = useState(0)
		const [resolvedItems, setResolvedItems] = useState<MentionItemT[]>([])
		const [isLoading, setIsLoading] = useState(false)
		const debouncedRef = useRef<ReturnType<typeof debounce<[string]>>>()

		const staticItems: MentionItemT[] = Array.isArray(props.items) ? (props.items as MentionItemT[]) : []
		const query = String(props.query || '')
		const hasSource = typeof props.source === 'function'
		const items = hasSource ? resolvedItems : staticItems.filter((item) => !query || (item.label || '').toLowerCase().includes(query.toLowerCase()))
		const selectable = (index: number) => Boolean(items[index] && !items[index].isDisabled)

		useEffect(() => {
			setActiveIndex(0)
		}, [query, props.items])

		useEffect(() => {
			if (!hasSource) return
			const runDebounced =
				debouncedRef.current ??
				(debouncedRef.current = debounce((nextQuery: string) => {
					setIsLoading(true)
					Promise.resolve((props.source as (q: string) => Promise<MentionItemT[]> | MentionItemT[])(nextQuery))
						.then((result) => setResolvedItems(Array.isArray(result) ? result : []))
						.finally(() => setIsLoading(false))
				}, props.debounceMs ?? 250))
			runDebounced(query)
			return () => runDebounced.cancel()
		}, [query, hasSource])

		useEffect(() => {
			if (!isLoading && items.length === 0 && (query || !hasSource)) props.empty()
		}, [items.length, isLoading, query])

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
			const item = items[index]
			if (!item || item.isDisabled) return
			props.select({ value: item.value || item.label || '', label: item.label || '' })
		}

		const onKeyDown = createLiveQueryMenuKeyDownHandler({
			itemCount: items.length,
			activeIndex,
			isSelectable: selectable,
			onMove: setActiveIndex,
			onCommit: commit,
			onClose: () => props.dismiss()
		})

		useEffect(() => {
			if (!isOpen) return
			document.addEventListener('keydown', onKeyDown, true)
			return () => document.removeEventListener('keydown', onKeyDown, true)
		}, [isOpen, activeIndex, items.length])

		const surfaceClass = ['surface']
			.concat(phase === 'open' ? ['is-open'] : [])
			.concat(phase === 'closing' ? ['is-closing'] : [])
			.join(' ')

		if (phase === 'closed' && !isOpen) return <host shadowDom></host>

		const activeId = items[activeIndex] ? `mention-item-${items[activeIndex].value || activeIndex}` : undefined

		return (
			<host shadowDom>
				<div
					ref={floatRef}
					class={surfaceClass}
					role="listbox"
					aria-label={`${props.trigger || '@'} mentions`}
					aria-activedescendant={activeId}
				>
					{isLoading && items.length === 0 && <div class="empty">Loading…</div>}
					{!isLoading && items.length === 0 && <div class="empty">{props.emptyText || 'No matches'}</div>}
					{items.map((item, index) => {
						const itemClass = ['item']
							.concat(index === activeIndex ? ['is-active'] : [])
							.concat(item.isDisabled ? ['is-disabled'] : [])
							.join(' ')
						return (
							<button
								key={item.value || item.label || index}
								id={`mention-item-${item.value || index}`}
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
			trigger: { type: String, reflect: true },
			items: { type: Array },
			source: AnyProp,
			query: { type: String },
			debounceMs: { type: Number },
			anchorRect: AnyProp,
			placement: { type: String, reflect: true },
			offset: { type: Number },
			emptyText: String,
			isOpen: { type: Boolean, reflect: true },
			select: event<{ value: string; label: string }>({ bubbles: true, composed: true }),
			empty: event<void>({ bubbles: true, composed: true }),
			dismiss: event<void>({ bubbles: true, composed: true })
		},
		styles: [floatingSurfaceStyles, floatingMenuStyles, floatingMenuItemStyles, styles]
	}
)

customElements.define('z-mention-popover', ZMentionPopover)
