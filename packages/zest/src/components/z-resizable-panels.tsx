import { c, css, event, useHost, useRef, useEffect } from 'atomico'

/*
 * z-resizable-panels — a group of resizable panes, modeled on
 * react-resizable-panels. Author it declaratively (same shape as z-range /
 * z-range-handle): z-panel children separated by z-panel-handle separators.
 *
 *   <z-resizable-panels direction="row" auto-save-id="editor">
 *     <z-panel default-size="20%" min-size="160px" collapsible>…</z-panel>
 *     <z-panel-handle></z-panel-handle>
 *     <z-panel min-size="30%">…</z-panel>
 *     <z-panel-handle></z-panel-handle>
 *     <z-panel default-size="25%" min-size="200px" max-size="480px">…</z-panel>
 *   </z-resizable-panels>
 *
 * Sizes accept `%` OR `px` (min-size == max-size ⇒ a fixed-size panel). Panels can
 * be `collapsible` (drag below `collapse-threshold` snaps to `collapsed-size`),
 * added/removed at runtime (layout re-normalizes, preserving surviving panes), and
 * persisted via `auto-save-id`. Internally the group keeps a percentage array and
 * drives each panel's flex-basis; handles call back into the group to move a
 * boundary. The group exposes getLayout/setLayout/reset; handles are the drag
 * targets and support keyboard resize.
 */
const styles = css`
	:host {
		display: flex;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	:host([direction='column']) {
		flex-direction: column;
	}
	::slotted(z-panel) {
		overflow: hidden;
		min-width: 0;
		min-height: 0;
	}
`

// Resolve a "%"/"px" size string against the group's px extent → percentage.
const toPct = (raw: string | null, groupPx: number, fallback: number): number => {
	if (!raw) return fallback
	if (raw.endsWith('%')) return parseFloat(raw)
	if (raw.endsWith('px')) return groupPx > 0 ? (parseFloat(raw) / groupPx) * 100 : fallback
	const n = parseFloat(raw)
	return Number.isFinite(n) ? n : fallback
}

// Panel-level events are dispatched by the group onto the panel element (rather
// than declared as Atomico props on z-panel, which would collide with its
// same-named imperative methods).
const dispatch = (el: Element, name: string, detail: unknown) =>
	el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }))

type Cons = {
	min: number
	max: number
	collapsible: boolean
	collapsed: number
	threshold: number
}

export const ZResizablePanels = c(
	(props) => {
		const host = useHost()
		// One store object (stable across renders) holds mutable layout state; Atomico's
		// Ref.current is typed optional, so we assert it non-null once here.
		const s = useRef({
			layout: [] as number[], // percentages, one per z-panel
			sizeOf: new WeakMap<Element, number>(), // survives re-init
			expandedOf: new WeakMap<Element, number>(), // pre-collapse size
			inited: false
		}).current!

		const el = () => host.current as HTMLElement
		const panels = () =>
			[...el().querySelectorAll(':scope > z-panel')] as HTMLElement[]
		const extent = () =>
			props.direction === 'column' ? el().clientHeight : el().clientWidth
		const isCollapsed = (p: Element) => p.hasAttribute('is-collapsed')

		const cons = (p: HTMLElement, g: number): Cons => {
			const min = toPct(p.getAttribute('min-size'), g, 0)
			const collapsed = toPct(p.getAttribute('collapsed-size'), g, 0)
			return {
				min,
				max: toPct(p.getAttribute('max-size'), g, 100),
				collapsible: p.hasAttribute('collapsible'),
				collapsed,
				threshold: p.hasAttribute('collapse-threshold')
					? toPct(p.getAttribute('collapse-threshold'), g, min)
					: Math.max(min, collapsed + 8)
			}
		}

		const saveKey = () => (props.autoSaveId ? `z-panels:${props.autoSaveId}` : null)

		const applyLayout = () => {
			const ps = panels()
			ps.forEach((p, i) => {
				p.style.flex = `0 0 ${s.layout[i]}%`
				s.sizeOf.set(p, s.layout[i])
			})
			props.layout({ sizes: [...s.layout] })
			const key = saveKey()
			if (key) localStorage.setItem(key, JSON.stringify(s.layout))
		}

		const initLayout = () => {
			const g = extent()
			const ps = panels()
			if (!ps.length) return
			const key = saveKey()
			const saved = key ? JSON.parse(localStorage.getItem(key) || 'null') : null

			let sizes: number[]
			if (!s.inited && Array.isArray(saved) && saved.length === ps.length) {
				sizes = saved
			} else {
				// Preserve panes we already sized (conditional add/remove); default the rest.
				sizes = ps.map((p, i) =>
					s.sizeOf.has(p)
						? (s.sizeOf.get(p) as number)
						: toPct(p.getAttribute('default-size'), g, 100 / ps.length)
				)
			}
			const total = sizes.reduce((a, b) => a + b, 0) || 1
			s.layout = sizes.map((s) => (s / total) * 100)
			s.inited = true
			applyLayout()
		}

		// Move the boundary controlled by handle i (between panel i and i+1).
		const resizeAt = (i: number, deltaPx: number) => {
			const ps = panels()
			if (!ps[i] || !ps[i + 1]) return
			const g = extent()
			const total = s.layout[i] + s.layout[i + 1]
			const ca = cons(ps[i], g)
			const cb = cons(ps[i + 1], g)
			let a = s.layout[i] + (deltaPx / g) * 100

			// Collapse snapping — dragging a collapsible pane below its threshold.
			if (ca.collapsible && a < ca.threshold) return collapsePanel(i)
			if (cb.collapsible && total - a < cb.threshold) return collapsePanel(i + 1)

			// Clamp to both panes' [min, max].
			a = Math.max(ca.min, Math.min(ca.max, a))
			let b = total - a
			b = Math.max(cb.min, Math.min(cb.max, b))
			a = total - b

			s.layout[i] = a
			s.layout[i + 1] = b
			// Dragging a collapsed pane back open un-collapses it.
			if (isCollapsed(ps[i]) && a > ca.collapsed + 0.5) ps[i].removeAttribute('is-collapsed')
			if (isCollapsed(ps[i + 1]) && b > cb.collapsed + 0.5)
				ps[i + 1].removeAttribute('is-collapsed')

			applyLayout()
			dispatch(ps[i], 'sizechange', { size: a })
			dispatch(ps[i + 1], 'sizechange', { size: b })
		}

		const collapsePanel = (i: number) => {
			const ps = panels()
			const p = ps[i]
			if (!p || isCollapsed(p)) return
			const g = extent()
			const collapsed = toPct(p.getAttribute('collapsed-size'), g, 0)
			s.expandedOf.set(p, s.layout[i])
			const delta = s.layout[i] - collapsed
			const j = ps[i + 1] ? i + 1 : i - 1
			s.layout[i] = collapsed
			if (ps[j]) s.layout[j] += delta
			p.setAttribute('is-collapsed', '')
			applyLayout()
			dispatch(p, 'collapsechange', { collapsed: true })
		}

		const expandPanel = (i: number) => {
			const ps = panels()
			const p = ps[i]
			if (!p) return
			const g = extent()
			const want = s.expandedOf.get(p) ?? toPct(p.getAttribute('min-size'), g, 20)
			const delta = want - s.layout[i]
			const j = ps[i + 1] ? i + 1 : i - 1
			s.layout[i] = want
			if (ps[j]) s.layout[j] -= delta
			p.removeAttribute('is-collapsed')
			applyLayout()
			dispatch(p, 'collapsechange', { collapsed: false })
		}

		useEffect(() => {
			const g = host.current as any

			// Engine surface consumed by z-panel-handle / z-panel.
			g.__resizeAt = resizeAt
			g.__extent = extent
			g.__isDisabled = () => Boolean(props.isDisabled)
			g.__keyboardStep = () => props.keyboardStep ?? 5
			g.__panelIndexOfHandle = (handle: Element) => {
				let i = -1
				let n: Element | null = handle
				while ((n = n.previousElementSibling))
					if (n.tagName.toLowerCase() === 'z-panel') i++
				return i
			}
			g.__panelIndex = (panel: Element) => panels().indexOf(panel as HTMLElement)
			g.__collapsePanel = collapsePanel
			g.__expandPanel = expandPanel

			// Public imperative API.
			g.getLayout = () => [...s.layout]
			g.setLayout = (sizes: number[]) => {
				const total = sizes.reduce((a, b) => a + b, 0) || 1
				s.layout = sizes.map((s) => (s / total) * 100)
				applyLayout()
			}
			g.reset = () => {
				s.inited = false
				const key = saveKey()
				if (key) localStorage.removeItem(key)
				s.sizeOf = new WeakMap()
				initLayout()
			}

			initLayout()

			// Conditional panels: re-normalize when children are added/removed.
			const mo = new MutationObserver(() => initLayout())
			mo.observe(el(), { childList: true })
			// Keep px-based constraints honest as the group resizes.
			const ro = new ResizeObserver(() => {
				if (s.layout.length) applyLayout()
			})
			ro.observe(el())
			return () => {
				mo.disconnect()
				ro.disconnect()
			}
		}, [props.direction, props.autoSaveId, props.isDisabled])

		return (
			<host shadowDom>
				<slot />
			</host>
		)
	},
	{
		props: {
			direction: { type: String, reflect: true },
			autoSaveId: { type: String, reflect: true },
			keyboardStep: { type: Number, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			layout: event<{ sizes: number[] }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-resizable-panels', ZResizablePanels)

/*
 * z-panel-handle — the draggable separator between two panels. Renders a hairline
 * grip by default, but its slot lets you drop in a custom separator that stays the
 * drag target. Pointer drag moves the adjacent boundary; ←/→ (or ↑/↓ in a column
 * group) resize by the group's keyboard-step. Styleable via part="grip".
 */
const handleStyles = css`
	:host {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		align-self: stretch;
		background: transparent;
		touch-action: none;
		cursor: col-resize;
		padding: 0 5px; /* horizontal hit area for a row group */
	}
	/* Orientation is set imperatively (is-column) from the parent group's
	   direction, since :host-context isn't universally supported. */
	:host([is-column]) {
		cursor: row-resize;
		padding: 5px 0;
	}
	:host([is-disabled]) {
		cursor: default;
		pointer-events: none;
	}
	.grip {
		background: var(--border);
		border-radius: 999px;
		transition:
			background var(--duration-fast) var(--easing-standard),
			width var(--duration-fast) var(--easing-standard),
			height var(--duration-fast) var(--easing-standard);
	}
	:host(:not([is-column])) .grip {
		width: 1px;
		align-self: stretch; /* full height */
	}
	:host([is-column]) .grip {
		height: 1px;
		width: 100%; /* full width */
	}
	:host(:not([is-column]):hover) .grip,
	:host(:not([is-column]).is-dragging) .grip {
		background: var(--ring);
		width: 2px;
	}
	:host([is-column]:hover) .grip,
	:host([is-column].is-dragging) .grip {
		background: var(--ring);
		height: 2px;
	}
	:host(:focus-visible) {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: -2px;
		border-radius: var(--radius-sm);
	}
`

export const ZPanelHandle = c(
	(props) => {
		const host = useHost()
		const s = useRef({ active: false, last: 0 }).current!

		const group = () => (host.current as HTMLElement).parentElement as any
		const isColumn = () => group()?.getAttribute('direction') === 'column'

		// Mirror the group's orientation onto the host so CSS can flip the grip +
		// cursor without :host-context (which Firefox doesn't support).
		useEffect(() => {
			;(host.current as HTMLElement).toggleAttribute('is-column', isColumn())
		})

		const onDown = (e: PointerEvent) => {
			const g = group()
			if (props.isDisabled || g?.__isDisabled?.()) return
			s.active = true
			s.last = isColumn() ? e.clientY : e.clientX
			;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
			;(host.current as HTMLElement).classList.add('is-dragging')
			props.dragging({ isDragging: true })
		}
		const onMove = (e: PointerEvent) => {
			if (!s.active) return
			const g = group()
			const pos = isColumn() ? e.clientY : e.clientX
			g.__resizeAt(g.__panelIndexOfHandle(host.current), pos - s.last)
			s.last = pos
		}
		const onUp = () => {
			if (!s.active) return
			s.active = false
			;(host.current as HTMLElement).classList.remove('is-dragging')
			props.dragging({ isDragging: false })
		}
		const onKey = (e: KeyboardEvent) => {
			const g = group()
			if (props.isDisabled || !g) return
			const col = isColumn()
			const forward = col ? 'ArrowDown' : 'ArrowRight'
			const back = col ? 'ArrowUp' : 'ArrowLeft'
			if (e.key !== forward && e.key !== back) return
			e.preventDefault()
			const stepPx = (g.__keyboardStep() / 100) * g.__extent()
			g.__resizeAt(g.__panelIndexOfHandle(host.current), e.key === forward ? stepPx : -stepPx)
		}

		return (
			<host
				shadowDom
				role="separator"
				tabindex={props.isDisabled ? '-1' : '0'}
				aria-orientation={group()?.getAttribute('direction') === 'column' ? 'horizontal' : 'vertical'}
				onpointerdown={onDown}
				onpointermove={onMove}
				onpointerup={onUp}
				onpointercancel={onUp}
				onkeydown={onKey}
			>
				<slot>
					<div class="grip" part="grip" />
				</slot>
			</host>
		)
	},
	{
		props: {
			isDisabled: { type: Boolean, reflect: true },
			dragging: event<{ isDragging: boolean }>({ bubbles: true, composed: true })
		},
		styles: handleStyles
	}
)

customElements.define('z-panel-handle', ZPanelHandle)
