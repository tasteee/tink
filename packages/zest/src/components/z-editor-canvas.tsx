import { c, css, event, useProp, useHost, useRef, useEffect } from 'atomico'

/*
 * z-editor-canvas — an infinite, pannable / zoomable / pinchable surface. Content
 * lives in *canvas space* and is mapped to *screen space* by a single
 * `translate() scale()` transform on an inner .viewport. Every gesture and every
 * imperative call funnels through one writer (`commit`), so the viewport is always
 * consistent and observable.
 *
 *   screen = canvas * zoom + pan        canvas = (screen - pan) / zoom
 *
 * Gestures: wheel = zoom-to-cursor (or pan when `wheel="pan"` / trackpad), drag =
 * pan (honoring `pan-button` + held Space), two pointers = pinch-zoom about their
 * midpoint. State (`zoom`/`pan-x`/`pan-y`) is reflected to attributes and is
 * two-way, so it can be driven declaratively or read back off the DOM.
 *
 * Imperative API (on the element): zoomTo/zoomBy/panTo/panBy/fit/fitTo/reset and
 * the space converters screenToCanvas/canvasToScreen + getViewport.
 *
 * Slots: default = canvas space (transformed); `overlay` = screen space (fixed HUD
 * for z-zoom-controls / z-minimap). Companion: <z-canvas-item x y> positions its
 * content at a canvas coordinate.
 */
const styles = css`
	:host {
		display: block;
		position: relative;
		overflow: hidden;
		touch-action: none;
		background: var(--background);
		cursor: grab;
		--grid-color: color-mix(in oklch, var(--border) 60%, transparent);
	}
	:host([is-disabled]) {
		cursor: default;
	}
	:host(.is-panning) {
		cursor: grabbing;
	}
	:host(.is-space) {
		cursor: grab;
	}

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
		top: 0;
		left: 0;
		transform-origin: 0 0;
		will-change: transform;
	}

	.overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.overlay ::slotted(*) {
		pointer-events: auto;
	}
`

type Pt = { x: number; y: number }

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

		// Single viewport writer — commits state and emits the change events.
		const commit = (nx: number, ny: number, nz: number) => {
			const zoomed = nz !== z
			const panned = nx !== px || ny !== py
			if (!zoomed && !panned) return
			setPanX(nx)
			setPanY(ny)
			setZoom(nz)
			props.viewportchange({ x: nx, y: ny, zoom: nz })
			if (zoomed) props.zoomchange({ zoom: nz })
			if (panned) props.panchange({ x: nx, y: ny })
		}

		const rect = () => (host.current as HTMLElement).getBoundingClientRect()

		// Zoom to `nextZoom` while keeping the client point (cx,cy) pinned in place.
		const zoomAbout = (nextZoom: number, cx: number, cy: number) => {
			const r = rect()
			const sx = cx - r.left
			const sy = cy - r.top
			const nz = clampZoom(nextZoom)
			const k = nz / z
			commit(sx - (sx - px) * k, sy - (sy - py) * k, nz)
		}

		// --- wheel: zoom-to-cursor, or pan (trackpad / wheel="pan") ---
		const onWheel = (e: WheelEvent) => {
			if (props.isDisabled) return
			e.preventDefault()
			const zoomGesture = e.ctrlKey || (props.wheel ?? 'zoom') === 'zoom'
			if (zoomGesture) {
				const factor = Math.exp(-e.deltaY * 0.0015 * (props.zoomSpeed ?? 1))
				zoomAbout(z * factor, e.clientX, e.clientY)
			} else {
				commit(px - e.deltaX, py - e.deltaY, z)
			}
		}

		// --- pointer pan + two-pointer pinch ---
		// One store object (stable across renders) keeps the mutable gesture state;
		// Atomico's Ref.current is typed optional, so we assert it non-null once here.
		const s = useRef({
			pointers: new Map<number, Pt>(),
			drag: null as Pt | null,
			pinch: null as { dist: number; cx: number; cy: number } | null,
			spaceHeld: false
		}).current!

		const shouldPan = (e: PointerEvent) => {
			const mode = props.panButton ?? 'auto'
			if (e.button === 1) return true // middle always pans
			if (s.spaceHeld) return true
			if (mode === 'middle') return false
			return e.button === 0
		}

		const setPanningClass = (on: boolean) =>
			(host.current as HTMLElement).classList.toggle('is-panning', on)

		const onPointerDown = (e: PointerEvent) => {
			if (props.isDisabled) return
			;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
			s.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

			if (s.pointers.size === 2) {
				s.drag = null
				const pts = [...s.pointers.values()]
				s.pinch = {
					dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
					cx: (pts[0].x + pts[1].x) / 2,
					cy: (pts[0].y + pts[1].y) / 2
				}
			} else if (shouldPan(e)) {
				s.drag = { x: e.clientX, y: e.clientY }
				setPanningClass(true)
			}
		}

		const onPointerMove = (e: PointerEvent) => {
			if (!s.pointers.has(e.pointerId)) return
			s.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })

			if (s.pointers.size >= 2 && s.pinch) {
				const pts = [...s.pointers.values()]
				const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
				const cx = (pts[0].x + pts[1].x) / 2
				const cy = (pts[0].y + pts[1].y) / 2
				// Fold pan (midpoint drift) + zoom (distance ratio) into one commit so
				// the intermediate px/z aren't read stale between two setState calls.
				const r = rect()
				const dpx = cx - s.pinch.cx
				const dpy = cy - s.pinch.cy
				const nz = clampZoom(z * (dist / s.pinch.dist))
				const k = nz / z
				const sx = cx - r.left
				const sy = cy - r.top
				const pannedX = px + dpx
				const pannedY = py + dpy
				commit(sx - (sx - pannedX) * k, sy - (sy - pannedY) * k, nz)
				s.pinch = { dist, cx, cy }
			} else if (s.drag) {
				commit(px + (e.clientX - s.drag.x), py + (e.clientY - s.drag.y), z)
				s.drag = { x: e.clientX, y: e.clientY }
			}
		}

		const onPointerUp = (e: PointerEvent) => {
			s.pointers.delete(e.pointerId)
			if (s.pointers.size < 2) s.pinch = null
			if (s.pointers.size === 0) {
				s.drag = null
				setPanningClass(false)
			}
		}

		// Space-to-pan affordance.
		useEffect(() => {
			const el = host.current as HTMLElement
			const down = (e: KeyboardEvent) => {
				if (e.code === 'Space') {
					s.spaceHeld = true
					el.classList.add('is-space')
				}
			}
			const up = (e: KeyboardEvent) => {
				if (e.code === 'Space') {
					s.spaceHeld = false
					el.classList.remove('is-space')
				}
			}
			window.addEventListener('keydown', down)
			window.addEventListener('keyup', up)
			return () => {
				window.removeEventListener('keydown', down)
				window.removeEventListener('keyup', up)
			}
		}, [])

		// --- imperative API (recreated with fresh px/py/z each render) ---
		useEffect(() => {
			const el = host.current as any
			el.screenToCanvas = (p: Pt): Pt => ({ x: (p.x - px) / z, y: (p.y - py) / z })
			el.canvasToScreen = (p: Pt): Pt => ({ x: p.x * z + px, y: p.y * z + py })
			el.getViewport = () => ({ x: px, y: py, zoom: z })
			el.panTo = (x: number, y: number) => commit(x, y, z)
			el.panBy = (dx: number, dy: number) => commit(px + dx, py + dy, z)
			el.zoomTo = (s: number, c?: Pt) => {
				const r = rect()
				zoomAbout(s, c?.x ?? r.left + r.width / 2, c?.y ?? r.top + r.height / 2)
			}
			el.zoomBy = (f: number, c?: Pt) => el.zoomTo(z * f, c)
			el.reset = () => commit(0, 0, 1)

			// Fit the union of the default-slot children's bounding boxes into view.
			el.fit = (pad = 24) => {
				const kids = [...(host.current as HTMLElement).children].filter(
					(k) => (k as HTMLElement).getAttribute('slot') !== 'overlay'
				) as HTMLElement[]
				if (!kids.length) return
				const r = rect()
				let minX = Infinity,
					minY = Infinity,
					maxX = -Infinity,
					maxY = -Infinity
				for (const k of kids) {
					const b = k.getBoundingClientRect()
					// screen -> canvas using the current transform (bbox is transform-invariant)
					const l = (b.left - r.left - px) / z
					const t = (b.top - r.top - py) / z
					const rr = (b.right - r.left - px) / z
					const bb = (b.bottom - r.top - py) / z
					minX = Math.min(minX, l)
					minY = Math.min(minY, t)
					maxX = Math.max(maxX, rr)
					maxY = Math.max(maxY, bb)
				}
				const bw = maxX - minX
				const bh = maxY - minY
				if (bw <= 0 || bh <= 0) return
				const nz = clampZoom(Math.min((r.width - 2 * pad) / bw, (r.height - 2 * pad) / bh))
				commit((r.width - bw * nz) / 2 - minX * nz, (r.height - bh * nz) / 2 - minY * nz, nz)
			}

			el.fitTo = (target: DOMRect | Element, pad = 24) => {
				const r = rect()
				const b = target instanceof Element ? target.getBoundingClientRect() : target
				const l = (b.left - r.left - px) / z
				const t = (b.top - r.top - py) / z
				const bw = b.width / z
				const bh = b.height / z
				if (bw <= 0 || bh <= 0) return
				const nz = clampZoom(Math.min((r.width - 2 * pad) / bw, (r.height - 2 * pad) / bh))
				commit((r.width - bw * nz) / 2 - l * nz, (r.height - bh * nz) / 2 - t * nz, nz)
			}
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
				<div class="viewport" style={{ transform: `translate(${px}px, ${py}px) scale(${z})` }}>
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
			viewportchange: event<{ x: number; y: number; zoom: number }>({
				bubbles: true,
				composed: true
			}),
			zoomchange: event<{ zoom: number }>({ bubbles: true, composed: true }),
			panchange: event<{ x: number; y: number }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-editor-canvas', ZEditorCanvas)

/*
 * z-canvas-item — declarative positioning sugar. Lives inside the canvas's
 * (transformed) default slot and absolutely positions its content at canvas
 * coordinate (x, y), optionally sized (width/height) and rotated.
 */
const itemStyles = css`
	:host {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
	}
`

export const ZCanvasItem = c(
	(props) => (
		<host
			shadowDom
			style={{
				transform: `translate(${props.x ?? 0}px, ${props.y ?? 0}px) rotate(${props.rotation ?? 0}deg)`,
				width: props.width != null ? `${props.width}px` : undefined,
				height: props.height != null ? `${props.height}px` : undefined
			}}
		>
			<slot />
		</host>
	),
	{
		props: {
			x: { type: Number, reflect: true },
			y: { type: Number, reflect: true },
			width: { type: Number, reflect: true },
			height: { type: Number, reflect: true },
			rotation: { type: Number, reflect: true }
		},
		styles: itemStyles
	}
)

customElements.define('z-canvas-item', ZCanvasItem)
