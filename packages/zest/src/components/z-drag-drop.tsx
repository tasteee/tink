import { c, css, event, useHost, useRef, useEffect } from 'atomico'

/*
 * z-drag-drop — a general, pointer-based drag-and-drop engine (deliberately NOT
 * native HTML5 DnD, which is inconsistent and hard to style). Two elements share
 * a module-level registry:
 *
 *   <z-draggable type="card" .data=${obj}>…</z-draggable>
 *   <z-drop-target accept="card" @dropitem=${…}>…</z-drop-target>
 *
 * A draggable starts a drag after a small threshold, shows a floating preview
 * (a clone of itself, or a slotted `preview`), hit-tests registered targets under
 * the pointer, and on release drops onto a matching target. Targets match when
 * their `group` equals the draggable's `group` AND their `accept` list contains
 * the draggable's `type` (or accept is `*`). This engine is the substrate for
 * cross-area drags — panel→canvas, list→list, sidebar→editor.
 *
 * Events (all bubbling + composed):
 *   draggable  → `dragstart` {type,data} · `dragmove` {x,y,over} · `dragend` {dropped,target}
 *   drop-target→ `dragenter` · `dragover` · `dragleave` · `dropitem` {data,type,source,x,y}
 */

type DragState = {
	source: HTMLElement
	type: string
	data: unknown
	group: string
	preview: HTMLElement | null
	over: HTMLElement | null
	offsetX: number
	offsetY: number
}

let current: DragState | null = null
const targets = new Set<HTMLElement>()

const fire = (el: Element, name: string, detail: unknown) =>
	el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }))

const accepts = (target: HTMLElement, type: string, group: string): boolean => {
	if (target.hasAttribute('is-disabled')) return false
	if ((target.getAttribute('group') || '') !== group) return false
	const accept = (target.getAttribute('accept') || '*').trim()
	if (accept === '' || accept === '*') return true
	return accept.split(/\s+/).includes(type)
}

const targetUnder = (x: number, y: number): HTMLElement | null => {
	for (const el of document.elementsFromPoint(x, y)) {
		const t = (el as HTMLElement).closest?.('z-drop-target') as HTMLElement | null
		if (t && targets.has(t)) return t
	}
	return null
}

const detailOf = (x: number, y: number) => ({
	data: current!.data,
	type: current!.type,
	source: current!.source,
	x,
	y
})

const setOver = (t: HTMLElement | null, x: number, y: number) => {
	if (!current) return
	if (current.over === t) {
		if (t) fire(t, 'dragover', detailOf(x, y))
		return
	}
	if (current.over) {
		current.over.removeAttribute('data-state')
		fire(current.over, 'dragleave', detailOf(x, y))
	}
	current.over = t
	if (t) {
		t.setAttribute('data-state', accepts(t, current.type, current.group) ? 'over' : 'reject')
		fire(t, 'dragenter', detailOf(x, y))
	}
}

// ── z-draggable ──────────────────────────────────────────────────────────────
const draggableStyles = css`
	:host {
		display: block;
		touch-action: none;
	}
	:host([is-disabled]) {
		touch-action: auto;
	}
	:host(.is-dragging) {
		opacity: 0.4;
	}
	::slotted([slot='preview']) {
		display: none;
	}
`

export const ZDraggable = c(
	(props) => {
		const host = useHost()
		const s = useRef({ downX: 0, downY: 0, started: false, active: false }).current!

		const buildPreview = (downX: number, downY: number) => {
			const el = host.current as HTMLElement
			const slotted = el.querySelector('[slot="preview"]') as HTMLElement | null
			const node = (slotted ?? el).cloneNode(true) as HTMLElement
			node.removeAttribute('slot')
			const r = el.getBoundingClientRect()
			Object.assign(node.style, {
				position: 'fixed',
				left: '0',
				top: '0',
				width: `${r.width}px`,
				margin: '0',
				pointerEvents: 'none',
				opacity: '0.85',
				zIndex: '9999'
			})
			node.style.display = 'block'
			document.body.appendChild(node)
			current!.offsetX = downX - r.left
			current!.offsetY = downY - r.top
			return node
		}

		const place = (x: number, y: number) => {
			if (!current?.preview) return
			current.preview.style.transform = `translate(${x - current.offsetX}px, ${y - current.offsetY}px)`
		}

		const onDown = (e: PointerEvent) => {
			if (props.isDisabled) return
			if (props.handle && !(e.target as HTMLElement).closest(props.handle as string)) return
			;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
			s.downX = e.clientX
			s.downY = e.clientY
			s.started = true
			s.active = false
		}

		const onMove = (e: PointerEvent) => {
			if (!s.started) return
			if (!s.active) {
				if (Math.hypot(e.clientX - s.downX, e.clientY - s.downY) < 4) return
				s.active = true
				current = {
					source: host.current as HTMLElement,
					type: (props.type as string) || '',
					data: props.data,
					group: (props.group as string) || '',
					preview: null,
					over: null,
					offsetX: 0,
					offsetY: 0
				}
				current.preview = buildPreview(s.downX, s.downY)
				;(host.current as HTMLElement).classList.add('is-dragging')
				fire(host.current as HTMLElement, 'dragstart', { type: current.type, data: current.data })
			}
			place(e.clientX, e.clientY)
			setOver(targetUnder(e.clientX, e.clientY), e.clientX, e.clientY)
			fire(host.current as HTMLElement, 'dragmove', {
				x: e.clientX,
				y: e.clientY,
				over: current?.over ?? null
			})
		}

		const onUp = (e: PointerEvent) => {
			if (!s.started) return
			s.started = false
			if (!s.active) return
			s.active = false
			const t = current?.over ?? null
			const ok = !!(t && current && accepts(t, current.type, current.group))
			if (t && ok) fire(t, 'dropitem', detailOf(e.clientX, e.clientY))
			if (t) t.removeAttribute('data-state')
			;(host.current as HTMLElement).classList.remove('is-dragging')
			fire(host.current as HTMLElement, 'dragend', { dropped: ok, target: ok ? t : null })
			current?.preview?.remove()
			current = null
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
				<slot name="preview" />
			</host>
		)
	},
	{
		props: {
			type: { type: String, reflect: true },
			data: { type: Object },
			group: { type: String, reflect: true },
			handle: { type: String },
			isDisabled: { type: Boolean, reflect: true },
			dragstart: event<{ type: string; data: unknown }>({ bubbles: true, composed: true }),
			dragmove: event<{ x: number; y: number; over: Element | null }>({
				bubbles: true,
				composed: true
			}),
			dragend: event<{ dropped: boolean; target: Element | null }>({
				bubbles: true,
				composed: true
			})
		},
		styles: draggableStyles
	}
)

customElements.define('z-draggable', ZDraggable)

// ── z-drop-target ────────────────────────────────────────────────────────────
const dropTargetStyles = css`
	:host {
		display: block;
		border-radius: var(--radius-md);
		transition:
			background var(--duration-fast) var(--easing-standard),
			box-shadow var(--duration-fast) var(--easing-standard);
	}
	:host([data-state='over']) {
		background: color-mix(in oklch, var(--accent, var(--purple)) 12%, transparent);
		box-shadow: inset 0 0 0 2px var(--accent, var(--purple));
	}
	:host([data-state='reject']) {
		background: color-mix(in oklch, var(--destructive) 10%, transparent);
		box-shadow: inset 0 0 0 2px var(--destructive);
	}
`

export const ZDropTarget = c(
	(props) => {
		const host = useHost()
		// Register in the module target set for the lifetime of the element.
		useEffect(() => {
			const el = host.current as HTMLElement
			targets.add(el)
			return () => targets.delete(el)
		}, [])
		return (
			<host shadowDom>
				<slot />
			</host>
		)
	},
	{
		props: {
			accept: { type: String, reflect: true },
			group: { type: String, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			dragenter: event<unknown>({ bubbles: true, composed: true }),
			dragover: event<unknown>({ bubbles: true, composed: true }),
			dragleave: event<unknown>({ bubbles: true, composed: true }),
			dropitem: event<{ data: unknown; type: string; source: Element; x: number; y: number }>({
				bubbles: true,
				composed: true
			})
		},
		styles: dropTargetStyles
	}
)

customElements.define('z-drop-target', ZDropTarget)
