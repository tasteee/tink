import { c, css, event, useHost, useRef } from 'atomico'

/*
 * z-sortable — drag-to-reorder for its direct children. On pickup the dragged
 * child is lifted out of flow (fixed, following the pointer) and a same-sized
 * placeholder takes its place; as the pointer moves, the placeholder is moved
 * among the siblings by midpoint hit-testing; on release the child is dropped
 * where the placeholder sits. Operates on real light-DOM children, so the app
 * keeps ownership of the list — it just also gets a `sort` event to sync state.
 *
 *   <z-sortable axis="y" handle=".grip">
 *     <div>…</div> <div>…</div> …
 *   </z-sortable>
 *
 * Events: `start` {index} · `sort` {oldIndex,newIndex} · `end`.
 * Cross-list dragging (shared `group`) and FLIP easing are future enhancements.
 */
const styles = css`
	:host {
		display: block;
	}
	::slotted(*) {
		touch-action: none;
		user-select: none;
	}
	.placeholder {
		box-sizing: border-box;
		border: 1px dashed var(--border);
		border-radius: var(--radius-md);
		background: color-mix(in oklch, var(--muted) 8%, transparent);
	}
`

export const ZSortable = c(
	(props) => {
		const host = useHost()
		const s = useRef({
			dragged: null as HTMLElement | null,
			placeholder: null as HTMLElement | null,
			oldIndex: -1,
			grabX: 0,
			grabY: 0
		}).current!

		const el = () => host.current as HTMLElement
		const axis = () => (props.axis as string) || 'y'

		const childOf = (e: PointerEvent): HTMLElement | null => {
			for (const node of e.composedPath()) {
				const n = node as HTMLElement
				if (n.parentElement === el()) return n
			}
			return null
		}

		const onDown = (e: PointerEvent) => {
			if (props.isDisabled) return
			const child = childOf(e)
			if (!child || child.classList.contains('placeholder')) return
			if (props.handle && !(e.target as HTMLElement).closest(props.handle as string)) return

			const kids = [...el().children] as HTMLElement[]
			s.dragged = child
			s.oldIndex = kids.indexOf(child)
			const r = child.getBoundingClientRect()
			s.grabX = e.clientX - r.left
			s.grabY = e.clientY - r.top

			const ph = document.createElement('div')
			ph.className = 'placeholder'
			ph.style.width = `${r.width}px`
			ph.style.height = `${r.height}px`
			s.placeholder = ph
			el().insertBefore(ph, child)

			Object.assign(child.style, {
				position: 'fixed',
				left: `${r.left}px`,
				top: `${r.top}px`,
				width: `${r.width}px`,
				height: `${r.height}px`,
				margin: '0',
				zIndex: '9999',
				pointerEvents: 'none',
				boxShadow: '0 8px 24px rgba(0,0,0,0.28)'
			})
			;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
			props.start({ index: s.oldIndex })
		}

		const onMove = (e: PointerEvent) => {
			if (!s.dragged || !s.placeholder) return
			const a = axis()
			if (a !== 'x') s.dragged.style.top = `${e.clientY - s.grabY}px`
			if (a !== 'y') s.dragged.style.left = `${e.clientX - s.grabX}px`

			const sibs = [...el().children].filter(
				(c) => c !== s.dragged && c !== s.placeholder
			) as HTMLElement[]
			let placed = false
			for (const sib of sibs) {
				const r = sib.getBoundingClientRect()
				const mid = a === 'x' ? r.left + r.width / 2 : r.top + r.height / 2
				const p = a === 'x' ? e.clientX : e.clientY
				if (p < mid) {
					if (sib.previousElementSibling !== s.placeholder) el().insertBefore(s.placeholder, sib)
					placed = true
					break
				}
			}
			if (!placed && el().lastElementChild !== s.placeholder) el().appendChild(s.placeholder)
		}

		const onUp = () => {
			if (!s.dragged || !s.placeholder) return
			const child = s.dragged
			el().insertBefore(child, s.placeholder)
			s.placeholder.remove()
			for (const prop of ['position', 'left', 'top', 'width', 'height', 'margin', 'zIndex', 'pointerEvents', 'boxShadow'])
				child.style.removeProperty(prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()))

			const newIndex = [...el().children].indexOf(child)
			s.dragged = null
			s.placeholder = null
			if (newIndex !== s.oldIndex) props.sort({ oldIndex: s.oldIndex, newIndex })
			props.end()
		}

		return (
			<host
				shadowDom
				onpointerdown={onDown}
				onpointermove={onMove}
				onpointerup={onUp}
				onpointercancel={onUp}
			>
				<slot />
			</host>
		)
	},
	{
		props: {
			axis: { type: String, reflect: true },
			handle: { type: String },
			group: { type: String, reflect: true },
			animation: { type: Number },
			isDisabled: { type: Boolean, reflect: true },
			start: event<{ index: number }>({ bubbles: true, composed: true }),
			sort: event<{ oldIndex: number; newIndex: number }>({ bubbles: true, composed: true }),
			end: event<void>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-sortable', ZSortable)
