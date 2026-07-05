# Foundational primitives — specs & skeletons

Design specs and Atomico skeletons for the cross-domain primitives in
[`../ROADMAP.md`](../ROADMAP.md). Skeletons follow the shipped conventions:
`c(render, { props, styles })` + `customElements.define`, `useProp` for
two-way reflected state, `event<T>({ bubbles, composed })` for events,
`isX`/`doesX` boolean props, and `--token` values from `ink.css`.

Imperative APIs are attached to the host in an effect via `useHost()` — that's
how these elements expose methods (`canvas.fit()`, `group.getLayout()`) that
attributes alone can't.

Contents:
1. [`z-editor-canvas`](#1-z-editor-canvas) ⭐ (deep dive)
2. [`z-resizable-panels`](#2-z-resizable-panels) ⭐ (deep dive)
3. [`z-tree`](#3-z-tree)
4. [`z-virtual-list`](#4-z-virtual-list)
5. [`z-drag-drop`](#5-z-drag-drop)
6. [`z-sortable`](#6-z-sortable)
7. [`z-dropzone`](#7-z-dropzone)
8. [`z-markdown`](#8-z-markdown)
9. [`z-toolbar`](#9-z-toolbar)
10. [`z-relative-time`](#10-z-relative-time)
11. [`z-status-dot`](#11-z-status-dot)

---

## 1. `z-editor-canvas`

An infinite, pannable, zoomable surface. Content lives in **canvas space**; the
element maps it to **screen space** via a single `translate() scale()` transform.
Everything the host draws (grid, cursor) and every gesture (wheel-zoom-to-cursor,
drag-pan, two-finger pinch) works off that one transform, and the current
viewport is both readable and controllable from the DOM.

### Space model
- **Canvas space** — the infinite coordinate plane your content is authored in.
- **Screen space** — CSS pixels inside the element's box.
- Mapping: `screen = canvas * zoom + pan`. Inverse used for hit-testing:
  `canvas = (screen − pan) / zoom`. Both are exposed as `canvasToScreen()` /
  `screenToCanvas()` so callers never re-derive the math.

### Attributes (reflected)
| Attr | Type | Default | Notes |
|---|---|---|---|
| `zoom` | Number | `1` | current scale |
| `pan-x`, `pan-y` | Number | `0` | translation in screen px |
| `min-zoom` / `max-zoom` | Number | `0.1` / `8` | clamp |
| `zoom-speed` | Number | `1` | wheel sensitivity |
| `grid` | String | `dots` | `none` \| `dots` \| `lines` |
| `grid-size` | Number | `24` | canvas-space px between lines |
| `snap` | Number | `0` | grid snap step (0 = off) |
| `pan-button` | String | `auto` | `auto` \| `middle` \| `space` \| `left` |
| `wheel` | String | `zoom` | `zoom` \| `pan` (trackpad-friendly) |
| `is-disabled` | Boolean | – | freeze all interaction |

### Imperative API (on the element)
```ts
zoomTo(scale: number, centerClient?: {x, y}): void   // keeps centerClient fixed
zoomBy(factor: number, centerClient?): void
panTo(x: number, y: number): void
panBy(dx: number, dy: number): void
fit(padding = 24): void                               // fit all canvas children
fitTo(rectOrEl: DOMRect | Element, padding = 24): void
reset(): void                                         // zoom 1, pan 0
screenToCanvas(pt: {x, y}): {x, y}
canvasToScreen(pt: {x, y}): {x, y}
getViewport(): { x, y, zoom }
```

### Events (bubbling, composed)
- `viewportchange` → `{ x, y, zoom }` (fires on any pan/zoom)
- `zoomchange` → `{ zoom }`
- `panchange` → `{ x, y }`

### Slots
- default → **canvas space**, transformed with the viewport.
- `overlay` → **screen space**, fixed (put `z-zoom-controls`, `z-minimap`, HUD here).

### Companions
- `z-canvas-item` — absolutely positions its slot at canvas `x`/`y` (+ optional
  `w`/`h`, `rotation`). Purely declarative sugar over positioning in canvas space.
- `z-minimap` / `z-zoom-controls` — bind via a `for` attribute or `canvas` property.

### Skeleton

```tsx
// src/components/z-editor-canvas.tsx
import { c, css, event, useProp, useHost, useRef, useEffect } from 'atomico'

const styles = css`
	:host {
		display: block;
		position: relative;
		overflow: hidden;
		touch-action: none; /* we own pan/zoom gestures */
		background: var(--background);
		cursor: grab;
		--grid-color: color-mix(in oklch, var(--border) 60%, transparent);
	}
	:host([is-disabled]) { cursor: default; }
	:host(.is-panning) { cursor: grabbing; }

	/* Grid is painted on the host and scrolls/scales with the viewport via
	   background-size (grid-size * zoom) and background-position (pan). */
	:host([grid='dots']) {
		background-image: radial-gradient(var(--grid-color) 1px, transparent 1px);
	}
	:host([grid='lines']) {
		background-image:
			linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
			linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
	}

	.viewport {
		position: absolute;
		inset: 0;
		transform-origin: 0 0;
		will-change: transform;
	}
	.overlay {
		position: absolute;
		inset: 0;
		pointer-events: none; /* children opt back in */
	}
	.overlay ::slotted(*) { pointer-events: auto; }
`

export const ZEditorCanvas = c(
	(props) => {
		const host = useHost()
		const [zoom, setZoom] = useProp<number>('zoom')
		const [panX, setPanX] = useProp<number>('panX')
		const [panY, setPanY] = useProp<number>('panY')

		const z = zoom ?? 1
		const px = panX ?? 0
		const py = panY ?? 0

		const clampZoom = (v: number) =>
			Math.min(props.maxZoom ?? 8, Math.max(props.minZoom ?? 0.1, v))

		// --- core viewport writer: single place that commits + emits ---
		const commit = (nx: number, ny: number, nz: number) => {
			setPanX(nx); setPanY(ny); setZoom(nz)
			props.viewportchange({ x: nx, y: ny, zoom: nz })
		}

		// zoom about a fixed client point (cursor / pinch center)
		const zoomAbout = (nextZoom: number, cx: number, cy: number) => {
			const el = host.current as HTMLElement
			const rect = el.getBoundingClientRect()
			const sx = cx - rect.left, sy = cy - rect.top
			const clamped = clampZoom(nextZoom)
			// keep (sx,sy) anchored: solve pan so canvas point under cursor stays put
			const k = clamped / z
			commit(sx - (sx - px) * k, sy - (sy - py) * k, clamped)
		}

		// --- gestures ---
		const onWheel = (e: WheelEvent) => {
			if (props.isDisabled) return
			e.preventDefault()
			const zoomGesture = props.wheel === 'zoom' || e.ctrlKey // ctrlKey = pinch
			if (zoomGesture) {
				const factor = Math.exp(-e.deltaY * 0.0015 * (props.zoomSpeed ?? 1))
				zoomAbout(z * factor, e.clientX, e.clientY)
			} else {
				commit(px - e.deltaX, py - e.deltaY, z)
			}
		}

		const drag = useRef<{ x: number; y: number } | null>(null)
		const onPointerDown = (e: PointerEvent) => {
			if (props.isDisabled) return
			// TODO: honor pan-button (middle / space-held / left)
			;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
			drag.current = { x: e.clientX, y: e.clientY }
			;(host.current as HTMLElement).classList.add('is-panning')
		}
		const onPointerMove = (e: PointerEvent) => {
			if (!drag.current) return
			commit(px + (e.clientX - drag.current.x), py + (e.clientY - drag.current.y), z)
			drag.current = { x: e.clientX, y: e.clientY }
		}
		const onPointerUp = (e: PointerEvent) => {
			drag.current = null
			;(host.current as HTMLElement).classList.remove('is-panning')
		}
		// TODO: two-pointer pinch — track two active pointers, zoomAbout(midpoint)

		// --- imperative API on the host element ---
		useEffect(() => {
			const el = host.current as any
			const rect = () => (host.current as HTMLElement).getBoundingClientRect()
			el.screenToCanvas = (p: { x: number; y: number }) => ({
				x: (p.x - px) / z, y: (p.y - py) / z
			})
			el.canvasToScreen = (p: { x: number; y: number }) => ({
				x: p.x * z + px, y: p.y * z + py
			})
			el.getViewport = () => ({ x: px, y: py, zoom: z })
			el.panTo = (x: number, y: number) => commit(x, y, z)
			el.panBy = (dx: number, dy: number) => commit(px + dx, py + dy, z)
			el.zoomTo = (s: number, c?: { x: number; y: number }) => {
				const r = rect()
				zoomAbout(s, c?.x ?? r.left + r.width / 2, c?.y ?? r.top + r.height / 2)
			}
			el.zoomBy = (f: number, c?: { x: number; y: number }) => el.zoomTo(z * f, c)
			el.reset = () => commit(0, 0, 1)
			el.fit = (pad = 24) => {/* TODO measure slotted children bbox, solve zoom+pan */}
			el.fitTo = (target: DOMRect | Element, pad = 24) => {/* TODO */}
		}, [z, px, py])

		return (
			<host
				shadowDom
				onwheel={onWheel}
				onpointerdown={onPointerDown}
				onpointermove={onPointerMove}
				onpointerup={onPointerUp}
				onpointercancel={onPointerUp}
				style={{
					backgroundSize: `${(props.gridSize ?? 24) * z}px ${(props.gridSize ?? 24) * z}px`,
					backgroundPosition: `${px}px ${py}px`
				}}
			>
				<div
					class="viewport"
					style={{ transform: `translate(${px}px, ${py}px) scale(${z})` }}
				>
					<slot />
				</div>
				<div class="overlay">
					<slot name="overlay" />
				</div>
			</host>
		)
	},
	{
		props: {
			zoom: { type: Number, reflect: true },
			panX: { type: Number, reflect: true },
			panY: { type: Number, reflect: true },
			minZoom: { type: Number, reflect: true },
			maxZoom: { type: Number, reflect: true },
			zoomSpeed: { type: Number, reflect: true },
			grid: { type: String, reflect: true },
			gridSize: { type: Number, reflect: true },
			snap: { type: Number, reflect: true },
			panButton: { type: String, reflect: true },
			wheel: { type: String, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			viewportchange: event<{ x: number; y: number; zoom: number }>({ bubbles: true, composed: true }),
			zoomchange: event<{ zoom: number }>({ bubbles: true, composed: true }),
			panchange: event<{ x: number; y: number }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-editor-canvas', ZEditorCanvas)
```

**Skeleton gaps (intentional):** `pan-button` gating, `fit()`/`fitTo()` bbox
math, two-pointer pinch, `snap`, and momentum/inertia are stubbed. The transform
model, wheel-zoom-to-cursor, drag-pan, grid, and the full imperative surface are
wired so it's runnable immediately.

---

## 2. `z-resizable-panels`

Modeled directly on [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels):
a **group** contains **panels** separated by **handles** you author declaratively —
the same shape as the shipped `z-range` / `z-range-handle` pair, so it fits zest's
grain.

```html
<z-resizable-panels direction="row" auto-save-id="editor">
  <z-panel default-size="20%" min-size="160px" collapsible>…sidebar…</z-panel>
  <z-panel-handle></z-panel-handle>
  <z-panel min-size="30%">…main…</z-panel>
  <z-panel-handle></z-panel-handle>
  <z-panel default-size="25%" min-size="200px" max-size="480px">…inspector…</z-panel>
</z-resizable-panels>
```

### Parity with react-resizable-panels + the extras you asked for
- **`%` *and* `px` sizes** → `default-size`/`min-size`/`max-size` accept either
  unit. Setting `min-size="200px" max-size="200px"` gives a true **fixed-size
  panel** (the [fixed-size example](https://react-resizable-panels.vercel.app/examples/fixed-size-panels)),
  cleaner than the % workaround.
- **Collapsible panels** → `collapsible` + `collapsed-size` + `collapse-threshold`;
  dragging below the threshold snaps to collapsed; `collapse()`/`expand()` methods
  ([collapsible example](https://react-resizable-panels.vercel.app/examples/collapsible-panels)).
- **Conditional panels** → panels can be added/removed from the DOM at runtime; a
  `MutationObserver` re-reads children and re-normalizes the layout, preserving
  sibling sizes by `order`/`id` ([conditional example](https://react-resizable-panels.vercel.app/examples/conditional-panels)).
- **Custom separators** → `z-panel-handle` renders a default hairline but exposes a
  slot, so you drop any content in and it stays the click-drag target.
- **Persistence** → `auto-save-id` writes the layout to `localStorage` and restores it.
- **Nesting** → nest a `z-resizable-panels` inside a `z-panel` for IDE layouts.

### `z-resizable-panels` (group)
| Attr | Type | Default | Notes |
|---|---|---|---|
| `direction` | String | `row` | `row` \| `column` |
| `auto-save-id` | String | – | localStorage persistence key |
| `keyboard-step` | Number | `5` | % moved per arrow key on a focused handle |
| `is-disabled` | Boolean | – | lock all handles |

Methods: `getLayout(): number[]` (percentages) · `setLayout(sizes: number[])` ·
`reset()`. Event: `layout` → `{ sizes: number[] }`.

### `z-panel` (child)
| Attr | Type | Notes |
|---|---|---|
| `default-size` | String | `%` or `px`; initial size |
| `min-size` / `max-size` | String | `%` or `px` clamps (min==max ⇒ fixed) |
| `collapsible` | Boolean | can collapse to `collapsed-size` |
| `collapsed-size` | String | default `0` |
| `collapse-threshold` | String | drag below ⇒ snap collapsed |
| `order` | Number | stable slot for conditional mounting |
| `is-collapsed` | Boolean | reflected state |

Methods: `collapse()` · `expand()` · `resize(size)` · `getSize(): number` ·
`isCollapsed(): boolean`. Events (dispatched by the group onto the panel, named
to not collide with the methods): `sizechange` `{ size }` · `collapsechange`
`{ collapsed }`.

### `z-panel-handle` (separator)
| Attr | Type | Notes |
|---|---|---|
| `is-disabled` | Boolean | non-draggable |

Event: `dragging` `{ isDragging }`. Slot: custom separator content. Exposes
`part="handle"` / `part="grip"` for external styling.

### Skeleton (group + handle; panel is mostly declarative)

```tsx
// src/components/z-resizable-panels.tsx
import { c, css, event, useHost, useRef, useEffect } from 'atomico'

const styles = css`
	:host {
		display: flex;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	:host([direction='column']) { flex-direction: column; }
	:host([direction='row'])    { flex-direction: row; }
	/* Panels are sized by flex-basis we set imperatively from the layout array. */
	::slotted(z-panel) { overflow: hidden; }
`

// Resolve a "%"/"px" size string against the group's px extent → percentage.
const toPct = (raw: string | null, groupPx: number, fallback: number): number => {
	if (!raw) return fallback
	if (raw.endsWith('%')) return parseFloat(raw)
	if (raw.endsWith('px')) return (parseFloat(raw) / groupPx) * 100
	return parseFloat(raw) || fallback
}

export const ZResizablePanels = c(
	(props) => {
		const host = useHost()
		const layout = useRef<number[]>([]) // percentages, one per z-panel

		const panels = () =>
			[...(host.current as HTMLElement).querySelectorAll(':scope > z-panel')] as any[]
		const extent = () => {
			const el = host.current as HTMLElement
			return props.direction === 'column' ? el.clientHeight : el.clientWidth
		}

		const applyLayout = () => {
			const ps = panels()
			ps.forEach((p, i) => {
				p.style.flex = `0 0 ${layout.current[i]}%`
				p.style.minWidth = p.style.minHeight = '0'
			})
			props.layout({ sizes: layout.current })
			if (props.autoSaveId)
				localStorage.setItem(`z-panels:${props.autoSaveId}`, JSON.stringify(layout.current))
		}

		// Normalize sizes from panel attrs (defaults, min/max, persisted) → 100%.
		const initLayout = () => {
			const g = extent()
			const ps = panels()
			const saved = props.autoSaveId
				? JSON.parse(localStorage.getItem(`z-panels:${props.autoSaveId}`) || 'null')
				: null
			if (saved?.length === ps.length) { layout.current = saved; return applyLayout() }
			const sizes = ps.map((p, i) =>
				toPct(p.getAttribute('default-size'), g, 100 / ps.length))
			const total = sizes.reduce((a, b) => a + b, 0)
			layout.current = sizes.map((s) => (s / total) * 100)
			applyLayout()
		}

		// Called by a handle mid-drag: move the boundary between panel i and i+1.
		const resizeAt = (i: number, deltaPx: number) => {
			const g = extent()
			const ps = panels()
			const dPct = (deltaPx / g) * 100
			let a = layout.current[i] + dPct
			let b = layout.current[i + 1] - dPct
			// clamp against each neighbor's min/max (TODO: collapse snapping)
			const minA = toPct(ps[i].getAttribute('min-size'), g, 0)
			const maxA = toPct(ps[i].getAttribute('max-size'), g, 100)
			const minB = toPct(ps[i + 1].getAttribute('min-size'), g, 0)
			const maxB = toPct(ps[i + 1].getAttribute('max-size'), g, 100)
			if (a < minA || b < minB || a > maxA || b > maxB) return
			layout.current[i] = a
			layout.current[i + 1] = b
			applyLayout()
			ps[i].resize?.({ size: a }); ps[i + 1].resize?.({ size: b })
		}

		useEffect(() => {
			// Expose engine to child handles + imperative group API.
			const el = host.current as any
			el.__resizeAt = resizeAt
			el.__panelIndexOfHandle = (handle: Element) =>
				panels().filter((p) => p.compareDocumentPosition(handle) &
					Node.DOCUMENT_POSITION_FOLLOWING).length - 1
			el.getLayout = () => [...layout.current]
			el.setLayout = (s: number[]) => { layout.current = [...s]; applyLayout() }
			el.reset = () => initLayout()

			initLayout()
			// Conditional panels: re-normalize when children change.
			const mo = new MutationObserver(() => initLayout())
			mo.observe(host.current as Node, { childList: true })
			const ro = new ResizeObserver(() => applyLayout())
			ro.observe(host.current as Node)
			return () => { mo.disconnect(); ro.disconnect() }
		}, [props.direction, props.autoSaveId])

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

// --- the draggable separator -------------------------------------------------
const handleStyles = css`
	:host {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		cursor: col-resize;
		touch-action: none;
		--hit: 11px;
	}
	:host([is-disabled]) { cursor: default; pointer-events: none; }
	/* thin hit strip whose axis matches the group direction (set by group CSS) */
	.grip {
		background: var(--border);
		transition: background var(--duration-fast) var(--easing-standard);
	}
	:host(:hover) .grip, :host(.is-dragging) .grip { background: var(--ring); }
`

export const ZPanelHandle = c(
	(props) => {
		const host = useHost()
		const active = useRef(false)
		const start = useRef(0)

		const group = () => (host.current as HTMLElement).parentElement as any

		const onDown = (e: PointerEvent) => {
			if (props.isDisabled) return
			active.current = true
			start.current = group().direction === 'column' ? e.clientY : e.clientX
			;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
			;(host.current as HTMLElement).classList.add('is-dragging')
			props.dragging({ isDragging: true })
		}
		const onMove = (e: PointerEvent) => {
			if (!active.current) return
			const g = group()
			const pos = g.direction === 'column' ? e.clientY : e.clientX
			const i = g.__panelIndexOfHandle(host.current)
			g.__resizeAt(i, pos - start.current)
			start.current = pos
		}
		const onUp = () => {
			if (!active.current) return
			active.current = false
			;(host.current as HTMLElement).classList.remove('is-dragging')
			props.dragging({ isDragging: false })
		}

		return (
			<host
				shadowDom
				role="separator"
				tabindex="0"
				onpointerdown={onDown}
				onpointermove={onMove}
				onpointerup={onUp}
				onpointercancel={onUp}
			>
				<slot>
					<div class="grip" part="grip" style={{ width: '1px', height: '100%' }} />
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
```

```tsx
// src/components/z-panel.tsx — mostly a declarative host the group reads + drives.
import { c, css, event, useHost, useEffect } from 'atomico'

const styles = css`
	:host { display: block; position: relative; min-width: 0; min-height: 0; }
	:host([is-collapsed]) { overflow: hidden; }
`

export const ZPanel = c(
	(props) => {
		const host = useHost()
		useEffect(() => {
			const el = host.current as any
			el.collapse = () => {/* TODO ask group to resize this index to collapsed-size */}
			el.expand   = () => {/* TODO restore last-expanded size */}
			el.resize   = (s: number) => props.resize({ size: s })
			el.getSize  = () => parseFloat((host.current as HTMLElement).style.flexBasis) || 0
			el.isCollapsed = () => (host.current as HTMLElement).hasAttribute('is-collapsed')
		}, [])
		return <host shadowDom><slot /></host>
	},
	{
		props: {
			defaultSize: { type: String, reflect: true },
			minSize: { type: String, reflect: true },
			maxSize: { type: String, reflect: true },
			collapsible: { type: Boolean, reflect: true },
			collapsedSize: { type: String, reflect: true },
			collapseThreshold: { type: String, reflect: true },
			order: { type: Number, reflect: true },
			isCollapsed: { type: Boolean, reflect: true },
			resize: event<{ size: number }>({ bubbles: true, composed: true }),
			collapse: event<void>({ bubbles: true, composed: true }),
			expand: event<void>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-panel', ZPanel)
```

**Skeleton gaps:** collapse snapping/threshold, keyboard resize on focused handle,
`order`-aware layout preservation for conditional panels, and vertical grip sizing
are stubbed. The core — declarative composition, %/px resolution, live drag with
min/max clamping, persistence, and conditional re-normalization — is wired.

---

## 3. `z-tree`

Hierarchical disclosure with selection, keyboard nav, and drag-reorder. Two
authoring modes; recommend **data-driven** as primary (scales, virtualizes, and
avoids deep slotting), with a declarative `z-tree-item` sugar layer later.

**Data-driven API**
```ts
el.items = [{ id, label, icon?, children?, isExpanded?, isDisabled?, data? }]
```
| Attr / prop | Notes |
|---|---|
| `items` (prop) | node array (recursive) |
| `selection` | `single` \| `multiple` \| `none` |
| `selected` (prop) | array of ids |
| `expanded` (prop) | array of ids |
| `is-draggable` | enable reorder/reparent (via `z-drag-drop`) |
| `show-guides` | indent guide lines |
| `load-children` (prop) | `(node) => Promise<node[]>` async lazy children |

Methods: `expand(id)` · `collapse(id)` · `expandAll()` · `collapseAll()` ·
`select(id)` · `getSelection()` · `scrollToNode(id)`.
Events: `select` `{ ids, node }` · `expand`/`collapse` `{ id }` · `move`
`{ id, parentId, index }` (drag reparent/reorder) · `activate` `{ id }` (Enter/dblclick).
Keyboard: ↑/↓ roving, →/← expand/collapse, Enter activate, `type-ahead`, `*` expand siblings.
A11y: `role="tree"` / `treeitem` / `group`, `aria-expanded`, `aria-level`,
`aria-selected`. Renders flat internally (flatten visible nodes) so it can hand
off to **`z-virtual-list`** for large trees.

Node label rendering: `el.renderNode = (node) => Node` for custom rows; default
renders a twisty + optional icon + label. Used by docs nav, editor layers, file
explorers, dashboard hierarchies.

---

## 4. `z-virtual-list`

Windowed rendering — only visible rows (+ overscan) are in the DOM. A headless
primitive: consumer supplies items and a row renderer.

| Attr / prop | Notes |
|---|---|
| `items` (prop) | data array |
| `item-height` | fixed row px (fast path) |
| `estimate-size` | est px when heights vary; measured & cached |
| `overscan` | rows rendered beyond viewport (default 4) |
| `is-horizontal` | horizontal virtualization |
| `gap` | inter-row gap |
| `renderItem` (prop) | `(item, index) => Node` — required |
| `keyFn` (prop) | `(item, index) => string` stable keys |

Mechanics: a full-height spacer sets the scroll range; a translated inner window
holds only rendered rows; on scroll, compute `[start, end]` from
`scrollTop / rowHeight`. Dynamic heights use a measured-offset prefix-sum cache
(re-measure via `ResizeObserver`). Methods: `scrollToIndex(i, align?)` ·
`scrollToTop()` · `getVisibleRange()`. Event: `visiblerangechange` `{ start, end }`.
Composes into `z-data-grid` (rows), `z-tree` (flattened nodes), `z-conversation-list`,
`z-message-list`, and docs search results.

### Dynamic-height skeleton (the chat-blocking path)

Fixed `item-height` is the fast path; chat rows vary (images, replies, reactions),
so the windowing must **measure and cache** real heights. Strategy: keep a
prefix-sum of measured offsets, seed unmeasured rows with `estimate-size`, and
re-measure rendered rows via a `ResizeObserver`, correcting scrollTop so the
viewport doesn't jump when a row above resolves taller/shorter than its estimate.

```tsx
// src/components/z-virtual-list.tsx
import { c, css, event, useHost, useRef, useState, useEffect } from 'atomico'

const styles = css`
	:host { display: block; overflow: auto; position: relative; contain: strict; }
	.spacer { position: relative; width: 100%; }
	.window { position: absolute; top: 0; left: 0; right: 0; will-change: transform; }
`

export const ZVirtualList = c(
	(props) => {
		const host = useHost()
		const [range, setRange] = useState({ start: 0, end: 0 })
		// measured offsets: prefix-sum cache; offsets[i] = top of row i
		const offsets = useRef<number[]>([])
		const measured = useRef<boolean[]>([])
		const ro = useRef<ResizeObserver | null>(null)

		const items = props.items ?? []
		const est = props.estimateSize ?? props.itemHeight ?? 40
		const gap = props.gap ?? 0

		// rebuild prefix-sum from measured heights (est for unmeasured rows)
		const rebuild = () => {
			const o = offsets.current
			o[0] = 0
			for (let i = 1; i <= items.length; i++)
				o[i] = o[i - 1] + rowHeight(i - 1) + gap
		}
		const rowHeight = (i: number) =>
			measured.current[i] ? offsets.current[i + 1] - offsets.current[i] - gap : est
		const totalSize = () => offsets.current[items.length] ?? items.length * (est + gap)

		// binary-search the first row whose bottom is below scrollTop
		const findStart = (scrollTop: number) => {
			const o = offsets.current
			let lo = 0, hi = items.length - 1
			while (lo < hi) {
				const mid = (lo + hi) >> 1
				if (o[mid + 1] <= scrollTop) lo = mid + 1
				else hi = mid
			}
			return lo
		}

		const compute = () => {
			const el = host.current as HTMLElement
			const st = el.scrollTop
			const over = props.overscan ?? 4
			const start = Math.max(0, findStart(st) - over)
			let end = start
			const bottom = st + el.clientHeight
			while (end < items.length && offsets.current[end] < bottom) end++
			end = Math.min(items.length, end + over)
			if (start !== range.start || end !== range.end) setRange({ start, end })
		}

		// after render, measure the rows we just painted and correct if they
		// differ from the estimate (keeps scrollTop stable via delta on rows above)
		const measureRendered = () => {
			const el = host.current as HTMLElement
			const rows = el.shadowRoot!.querySelectorAll<HTMLElement>('.window > [data-index]')
			let dirty = false
			rows.forEach((node) => {
				const i = Number(node.dataset.index)
				const h = node.offsetHeight
				const prev = measured.current[i] ? rowHeight(i) : est
				if (!measured.current[i] || Math.abs(prev - h) > 0.5) {
					measured.current[i] = true
					// store height by writing the next offset lazily; rebuild reconciles
					offsets.current[i + 1] = offsets.current[i] + h + gap
					dirty = true
				}
			})
			if (dirty) { rebuild(); compute() }
		}

		useEffect(() => {
			rebuild(); compute()
			const el = host.current as HTMLElement
			const onScroll = () => compute()
			el.addEventListener('scroll', onScroll, { passive: true })
			ro.current = new ResizeObserver(() => { measureRendered() })
			// imperative API
			const api = host.current as any
			api.scrollToIndex = (i: number, align: 'start' | 'center' | 'end' = 'start') => {
				const top = offsets.current[i] ?? i * (est + gap)
				const h = el.clientHeight, rh = rowHeight(i)
				el.scrollTop = align === 'center' ? top - h / 2 + rh / 2
					: align === 'end' ? top - h + rh : top
			}
			api.scrollToTop = () => { el.scrollTop = 0 }
			api.scrollToBottom = () => { el.scrollTop = totalSize() }
			api.getVisibleRange = () => ({ ...range })
			return () => { el.removeEventListener('scroll', onScroll); ro.current?.disconnect() }
		}, [props.items, est, gap])

		// re-measure + observe the currently rendered rows each commit
		useEffect(() => {
			measureRendered()
			const el = host.current as HTMLElement
			el.shadowRoot!.querySelectorAll<HTMLElement>('.window > [data-index]')
				.forEach((n) => ro.current?.observe(n))
			props.visiblerangechange({ start: range.start, end: range.end })
		}, [range])

		const key = props.keyFn ?? ((_: unknown, i: number) => String(i))
		const slice = items.slice(range.start, range.end)

		return (
			<host shadowDom>
				<div class="spacer" style={{ height: `${totalSize()}px` }}>
					<div class="window" style={{ transform: `translateY(${offsets.current[range.start] ?? 0}px)` }}>
						{slice.map((item, n) => {
							const i = range.start + n
							return (
								<div data-index={i} key={key(item, i)}>
									{props.renderItem(item, i)}
								</div>
							)
						})}
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			items: { type: Array },
			itemHeight: { type: Number, reflect: true },
			estimateSize: { type: Number, reflect: true },
			overscan: { type: Number, reflect: true },
			isHorizontal: { type: Boolean, reflect: true },
			gap: { type: Number, reflect: true },
			renderItem: { type: Function },
			keyFn: { type: Function },
			visiblerangechange: event<{ start: number; end: number }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-virtual-list', ZVirtualList)
```

**Skeleton gaps:** horizontal virtualization (`is-horizontal`), sticky headers,
and "pin-to-bottom while streaming" (subtract from the bottom instead of the top
when new rows append) are stubbed — that last one is what `z-message-list` layers
on for chat. The measure/correct prefix-sum core is wired.

---

## 5. `z-drag-drop`

The **general pointer-based drag-and-drop engine** — the layer `z-sortable`,
`z-tree` reordering, kanban boards, and editor asset drags all build on. Deliberately
*not* native HTML5 DnD (which is inconsistent and un-stylable); a shared in-memory
registry coordinates a pointer drag between `z-draggable` sources and
`z-drop-target` sinks.

**`z-draggable`** — makes its content a drag source.
| Attr / prop | Notes |
|---|---|
| `type` | payload type string (matched against a target's `accept`) |
| `data` (prop) | arbitrary payload handed to the target on drop |
| `group` | namespace so unrelated DnD systems don't cross |
| `handle` | selector for a drag handle within the content |
| `is-disabled` | – |
Slot `preview` → custom drag image (defaults to a translucent clone). Events:
`dragstart` `{ data, type }` · `dragmove` `{ x, y, over }` · `dragend` `{ dropped, target }`.

**`z-drop-target`** — accepts drops.
| Attr / prop | Notes |
|---|---|
| `accept` | space-separated types (or `*`) |
| `group` | must match the draggable's group |
| `is-disabled` | – |
State parts for styling: `part="idle"` / `part="over"` / `part="reject"`. Events:
`dragenter` · `dragover` · `dragleave` · `dropitem` `{ data, type, source, x, y }`.

Engine notes: on `pointerdown` in a draggable, capture and start tracking; on move,
hit-test registered targets under the pointer (respecting `group`/`accept`), fire
enter/leave/over; on `pointerup` over a valid target, fire `dropitem`. Exposes a
`z-drag-drop` context element (optional) to scope a registry; otherwise a module
singleton. Auto-scroll near edges of scroll containers. This is the essential
primitive you flagged — every cross-area drag (panel → canvas, list → list,
sidebar → editor) routes through it.

---

## 6. `z-sortable`

Drag-to-reorder **within a single container**, built on `z-drag-drop`. Wraps its
slotted children; while dragging, it opens a gap and FLIP-animates siblings.

| Attr / prop | Notes |
|---|---|
| `axis` | `y` (default) \| `x` \| `both` (grid) |
| `handle` | selector for per-item drag handle |
| `group` | shared group ⇒ drag items **between** sortables (kanban) |
| `animation` | ms for FLIP transitions (default 160) |
| `is-disabled` | – |
Events: `start` `{ index }` · `sort` `{ oldIndex, newIndex }` · `end`. Operates on
light-DOM children so the app keeps ownership of the actual list/model. Powers
editor layer reordering, dashboard widget arrangement, kanban columns, playlist rows.

---

## 7. `z-dropzone`

Specialized **file** drop area (distinct from the generic `z-drag-drop`) — handles
OS drag-in and click-to-browse, with validation.

| Attr / prop | Notes |
|---|---|
| `accept` | MIME/extension filter (e.g. `image/*,.pdf`) |
| `multiple` | allow multiple files |
| `max-size` | per-file byte limit |
| `max-files` | count limit |
| `is-disabled` | – |
State parts: `part="idle"` / `part="over"` / `part="reject"`. Slot for custom
content (icon + copy); default renders a dashed well. Clicking opens a hidden
`<input type=file>`. Events: `dragenter` · `dragleave` · `drop` `{ files }` ·
`reject` `{ files, reason }`. Composes into chat `z-file-drop`, editor asset import,
dashboard CSV upload, blog media upload.

---

## 8. `z-markdown`

The **shared markdown renderer** behind chat, blog, and docs. Parses markdown and
renders it by composing existing `z-*` (code → `z-code-block`, tables → `z-table`,
links → `z-link`, blockquotes/callouts, `z-kbd`), so output is themed and consistent
everywhere. Streaming-safe: tolerant of half-written tokens as text arrives.

| Attr / prop | Notes |
|---|---|
| `content` (prop or attr) | markdown source |
| `is-streaming` | keep the trailing block "open"; re-render incrementally |
| `does-sanitize` | sanitize HTML (default on) |
| `does-highlight` | route fenced code through `z-code-block` highlighting |
| `heading-anchors` | add `#` links (docs mode) |
Events: `linkclick` `{ href }` · `copy` `{ text }` (from code blocks). Parser
(markdown-it / micromark) bundled like `highlight.js` already is. Streaming
strategy: parse committed blocks once, keep only the last block reactive so token
appends don't reflow the whole document. Blog uses it inside `z-article`/`z-prose`;
docs adds `heading-anchors` + `z-code-group`; chat sets `is-streaming`.

### Skeleton

Parse to block tokens (markdown-it), render each block to a DOM node, and — while
streaming — treat the **committed prefix** as immutable and re-render only the
**tail block** as tokens arrive. That's the whole streaming trick: block N stops
changing once block N+1 opens, so appended text only ever reflows the last block.

```tsx
// src/components/z-markdown.tsx
import { c, css, event, useHost, useMemo, useEffect, useRef } from 'atomico'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({ html: false, linkify: true, breaks: true })

const styles = css`
	:host { display: block; color: var(--foreground); line-height: 1.6; }
	::slotted(*), * { max-width: 100%; }
	a { color: var(--primary); text-decoration: underline; }
`

// Split source into top-level blocks so we can render them independently and
// keep the committed prefix stable while the last block streams.
const splitBlocks = (src: string): string[] => {
	const tokens = md.parse(src, {})
	const blocks: string[] = []
	for (const t of tokens) {
		if (t.level === 0 && t.map) blocks.push(src.slice(0, 0)) // placeholder
	}
	// simplest robust split: blank-line separated, but respect fenced code
	return src.split(/\n{2,}/)
}

// Render one block's HTML, then upgrade fenced code / tables / links to z-*.
const renderBlock = (source: string, opts: { highlight?: boolean }): Node => {
	const wrap = document.createElement('div')
	wrap.innerHTML = md.render(source)
	if (opts.highlight)
		wrap.querySelectorAll('pre > code').forEach((code) => {
			const block = document.createElement('z-code-block')
			const cls = code.getAttribute('class') || ''
			const lang = cls.match(/language-(\w+)/)?.[1]
			if (lang) block.setAttribute('language', lang)
			block.setAttribute('code', code.textContent ?? '')
			code.closest('pre')!.replaceWith(block)
		})
	wrap.querySelectorAll('table').forEach((t) => {
		const zt = document.createElement('z-table')
		zt.append(...t.childNodes) // TODO: map thead/tbody → z-table API
		t.replaceWith(zt)
	})
	return wrap
}

export const ZMarkdown = c(
	(props) => {
		const host = useHost()
		const mount = useRef<HTMLDivElement>(null)
		// cache rendered nodes per committed block so streaming re-renders only the tail
		const cache = useRef<{ src: string; node: Node }[]>([])

		const blocks = useMemo(() => splitBlocks(props.content ?? ''), [props.content])

		useEffect(() => {
			const root = mount.current!
			const opts = { highlight: props.doesHighlight ?? true }
			// reconcile: reuse cached nodes whose source is unchanged (the prefix)
			for (let i = 0; i < blocks.length; i++) {
				const isTail = props.isStreaming && i === blocks.length - 1
				if (cache.current[i] && cache.current[i].src === blocks[i] && !isTail) continue
				const node = renderBlock(blocks[i], opts)
				if (root.childNodes[i]) root.replaceChild(node, root.childNodes[i])
				else root.appendChild(node)
				cache.current[i] = { src: blocks[i], node }
			}
			// drop stale trailing nodes
			while (root.childNodes.length > blocks.length) root.lastChild!.remove()
			cache.current.length = blocks.length
		}, [blocks, props.isStreaming, props.doesHighlight])

		const onClick = (e: MouseEvent) => {
			const a = (e.target as HTMLElement).closest('a')
			if (a) props.linkclick({ href: a.getAttribute('href') ?? '' })
		}

		return <host shadowDom onclick={onClick}><div ref={mount} /></host>
	},
	{
		props: {
			content: { type: String, reflect: true },
			isStreaming: { type: Boolean, reflect: true },
			doesSanitize: { type: Boolean, reflect: true },
			doesHighlight: { type: Boolean, reflect: true },
			headingAnchors: { type: Boolean, reflect: true },
			linkclick: event<{ href: string }>({ bubbles: true, composed: true }),
			copy: event<{ text: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-markdown', ZMarkdown)
```

**Skeleton gaps:** HTML sanitization (`does-sanitize` — wire DOMPurify before
enabling `html:true`), `heading-anchors`, full `z-table` mapping, and a
smarter block splitter that keeps fenced code / lists intact (the naive
blank-line split is a placeholder). The block-cache streaming model — render the
committed prefix once, re-render only the tail — is the load-bearing part and is
wired.

---

## 9. `z-toolbar`

Horizontal (or vertical) action strip with real toolbar semantics and graceful
overflow. Holds slotted `z-button` / `z-toggle` / `z-tool-button`, grouped by
`z-toolbar-group` and divided by `z-separator`.

| Attr | Type | Notes |
|---|---|---|
| `orientation` | String | `horizontal` (default) \| `vertical` |
| `size` | String | `sm` \| `md` \| `lg` — sizes slotted controls |
| `overflow` | String | `menu` (collapse extras into ⋯, default) \| `scroll` \| `wrap` |
| `is-disabled` | Boolean | – |
A11y: `role="toolbar"`, **roving tabindex** (arrow keys move focus across items,
Home/End to ends) — one tab stop for the whole bar. `overflow="menu"` measures with
a `ResizeObserver` and moves items that don't fit into a trailing `z-menu`. Used by
the dashboard `z-page-header`, editor tool strips, and the chat composer.

### Skeleton

```tsx
// src/components/z-toolbar.tsx
import { c, css, useHost, useEffect } from 'atomico'

const styles = css`
	:host {
		display: flex; align-items: center; gap: var(--space-1, 4px);
		min-width: 0;
	}
	:host([orientation='vertical']) { flex-direction: column; align-items: stretch; }
	:host([overflow='scroll']) { overflow: auto; }
	:host([overflow='wrap']) { flex-wrap: wrap; }
	:host([is-disabled]) { opacity: 0.5; pointer-events: none; }
	.overflow { margin-inline-start: auto; }
`

// roving tabindex: exactly one focusable item; arrows move focus, Home/End jump.
const FOCUSABLE = 'z-button, z-toggle, z-tool-button, [role="button"], button'

export const ZToolbar = c(
	(props) => {
		const host = useHost()
		const items = () =>
			[...(host.current as HTMLElement).querySelectorAll(FOCUSABLE)] as HTMLElement[]

		const setRoving = (activeIdx = 0) =>
			items().forEach((el, i) => (el.tabIndex = i === activeIdx ? 0 : -1))

		const onKeyDown = (e: KeyboardEvent) => {
			const list = items()
			const cur = list.indexOf(document.activeElement as HTMLElement)
			if (cur < 0) return
			const horiz = (props.orientation ?? 'horizontal') === 'horizontal'
			const next = horiz ? 'ArrowRight' : 'ArrowDown'
			const prev = horiz ? 'ArrowLeft' : 'ArrowUp'
			let to = cur
			if (e.key === next) to = (cur + 1) % list.length
			else if (e.key === prev) to = (cur - 1 + list.length) % list.length
			else if (e.key === 'Home') to = 0
			else if (e.key === 'End') to = list.length - 1
			else return
			e.preventDefault()
			setRoving(to)
			list[to].focus()
		}

		// overflow="menu": measure, move non-fitting items into a trailing z-menu.
		const reflow = () => {
			if ((props.overflow ?? 'menu') !== 'menu') return
			// TODO: measure each item's right edge vs host width; move overflow
			// into a shadow z-menu triggered by a ⋯ button. Re-run on resize.
		}

		useEffect(() => {
			setRoving()
			const ro = new ResizeObserver(reflow)
			ro.observe(host.current as Node)
			reflow()
			return () => ro.disconnect()
		}, [props.orientation, props.overflow, props.size])

		return (
			<host shadowDom role="toolbar"
				aria-orientation={props.orientation ?? 'horizontal'}
				onkeydown={onKeyDown}>
				<slot />
				<div class="overflow"><slot name="overflow" /></div>
			</host>
		)
	},
	{
		props: {
			orientation: { type: String, reflect: true },
			size: { type: String, reflect: true },
			overflow: { type: String, reflect: true },
			isDisabled: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-toolbar', ZToolbar)
```

**Skeleton gaps:** the `overflow="menu"` measure-and-collapse into a trailing
`z-menu`, `size`-driven sizing of slotted controls, and `z-toolbar-group` /
`z-separator` composition are stubbed. `role="toolbar"` + roving tabindex (one
tab stop, arrow/Home/End navigation) is wired.

---

## 10. `z-relative-time`

A tiny auto-updating timestamp — "just now", "2m", "3h", "Yesterday", then an
absolute date past a threshold. Every chat message and conversation row uses it;
so do dashboards. Ticks on a shared interval (one timer for all instances) and
exposes the absolute time on hover via `title`.

| Attr | Type | Notes |
|---|---|---|
| `datetime` | String | ISO string or epoch ms |
| `format` | String | `relative` (default) \| `short` \| `time` \| `date` |
| `threshold` | Number | ms after which it shows an absolute date (default 7d) |
| `refresh` | Number | tick interval ms (default 60000) |

```tsx
// src/components/z-relative-time.tsx
import { c, css, useState, useEffect } from 'atomico'

const styles = css`:host { display: inline; color: inherit; }`

const fmt = (ms: number, threshold: number): string => {
	const diff = Date.now() - ms
	const s = Math.round(diff / 1000)
	if (s < 45) return 'just now'
	const m = Math.round(s / 60);   if (m < 60) return `${m}m`
	const h = Math.round(m / 60);   if (h < 24) return `${h}h`
	const d = Math.round(h / 24)
	if (diff < threshold) return d === 1 ? 'Yesterday' : `${d}d`
	return new Date(ms).toLocaleDateString()
}

// one shared clock so 1000 timestamps don't schedule 1000 timers
const subs = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | null = null
const subscribe = (fn: () => void, refresh: number) => {
	subs.add(fn)
	if (!timer) timer = setInterval(() => subs.forEach((f) => f()), refresh)
	return () => { subs.delete(fn); if (!subs.size && timer) { clearInterval(timer); timer = null } }
}

export const ZRelativeTime = c(
	(props) => {
		const [, tick] = useState(0)
		const ms = typeof props.datetime === 'number'
			? props.datetime : Date.parse(props.datetime ?? '')
		useEffect(() => subscribe(() => tick((n) => n + 1), props.refresh ?? 60000), [props.refresh])
		return (
			<host shadowDom title={Number.isNaN(ms) ? '' : new Date(ms).toLocaleString()}>
				{Number.isNaN(ms) ? '' : fmt(ms, props.threshold ?? 7 * 864e5)}
			</host>
		)
	},
	{
		props: {
			datetime: { type: String, reflect: true },
			format: { type: String, reflect: true },
			threshold: { type: Number, reflect: true },
			refresh: { type: Number, reflect: true }
		},
		styles
	}
)

customElements.define('z-relative-time', ZRelativeTime)
```

**Gap:** `format` variants (`short`/`time`/`date`) beyond the default relative
string. The shared-clock tick and relative/absolute threshold are wired.

---

## 11. `z-status-dot`

Presence indicator — a small colored dot, optionally with a pulse for "live" and
a label. Sits on avatars (`part="dot"`, positioned by the consumer), headers, and
member lists.

| Attr | Type | Notes |
|---|---|---|
| `status` | String | `online` \| `away` \| `dnd` \| `offline` \| `busy` |
| `size` | String | `sm` (default) \| `md` \| `lg` |
| `pulse` | Boolean | animate a ring (live/online) |
| `label` | String | optional text after the dot |

```tsx
// src/components/z-status-dot.tsx
import { c, css } from 'atomico'

const styles = css`
	:host {
		display: inline-flex; align-items: center; gap: var(--space-1, 4px);
		--dot: 8px;
		--color: var(--muted-foreground);
	}
	:host([size='md']) { --dot: 10px; }
	:host([size='lg']) { --dot: 12px; }
	:host([status='online']) { --color: var(--success, oklch(0.72 0.19 149)); }
	:host([status='away'])   { --color: var(--warning, oklch(0.79 0.16 86)); }
	:host([status='dnd']),
	:host([status='busy'])   { --color: var(--destructive, oklch(0.63 0.24 25)); }
	:host([status='offline']){ --color: var(--muted-foreground); }
	.dot {
		width: var(--dot); height: var(--dot); border-radius: 50%;
		background: var(--color); position: relative; flex: 0 0 auto;
	}
	:host([pulse]) .dot::after {
		content: ''; position: absolute; inset: 0; border-radius: 50%;
		background: var(--color); animation: ping 1.6s var(--easing-standard, ease-out) infinite;
	}
	@keyframes ping { 0% { opacity: .6; transform: scale(1); } 100% { opacity: 0; transform: scale(2.4); } }
	.label { font-size: 0.8125rem; color: var(--muted-foreground); }
`

export const ZStatusDot = c(
	(props) => (
		<host shadowDom role="status" aria-label={props.status}>
			<span class="dot" part="dot" />
			{props.label ? <span class="label">{props.label}</span> : null}
		</host>
	),
	{
		props: {
			status: { type: String, reflect: true },
			size: { type: String, reflect: true },
			pulse: { type: Boolean, reflect: true },
			label: { type: String, reflect: true }
		},
		styles
	}
)

customElements.define('z-status-dot', ZStatusDot)
```

**Gap:** none load-bearing — the token fallbacks assume `--success`/`--warning`/
`--destructive` may not exist yet in `ink.css`; wire real presence tokens there.

---

## Notes on conventions used above

- **Imperative methods** are attached to `host.current` inside `useEffect` (see
  `z-editor-canvas`), since Atomico props cover attributes/reactivity but not
  methods. Consumers call `el.fit()`, `el.getLayout()` directly on the DOM node.
- **Declarative composition** (`z-resizable-panels` → `z-panel` / `z-panel-handle`,
  `z-tree` → `z-tree-item`) mirrors the shipped `z-range` / `z-range-handle` and
  `z-tabs` patterns.
- **Styling hooks:** stateful primitives expose CSS `part`s (`part="over"`,
  `part="grip"`) so consumers can restyle drag/hover/handle states without piercing
  internals; interactive states also use `--token`s from `ink.css`
  (`--border`, `--ring`, `--duration-fast`, `--easing-standard`).
