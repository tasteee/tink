import { c, css, event, useHost, useRef, useEffect } from 'atomico'
import { themedScrollbarStyles } from '../shared/scrollbar-styles'

/*
 * z-virtual-list — windowed rendering: only the rows in view (plus overscan) are
 * in the DOM, so lists of thousands of items scroll cheaply. Headless — you
 * supply the data and a row renderer:
 *
 *   const list = document.querySelector('z-virtual-list')
 *   list.items = bigArray
 *   list.itemHeight = 40
 *   list.renderItem = (item, i) => { const el = document.createElement('div'); … return el }
 *
 * `renderItem` may return a DOM Node or an HTML string.
 *
 * Two sizing modes:
 *   - Fixed (fast path): set `item-height`. Offsets are pure arithmetic.
 *   - Dynamic: set `estimate-size` (and no `item-height`). Rows are measured as
 *     they render and cached in a prefix-sum, so variable-height rows (chat
 *     messages with images, replies, reactions) window correctly. Unmeasured
 *     rows use the estimate until they scroll into view.
 *
 * Methods: scrollToIndex(i, align?) · scrollToTop() · scrollToBottom() ·
 * getVisibleRange(). Event: `visiblerangechange` {start,end}.
 */
const styles = css`
	:host {
		display: block;
		overflow: auto;
		position: relative;
		contain: strict;
	}
	.sizer {
		position: relative;
		min-width: 100%;
	}
	.window {
		position: absolute;
		top: 0;
		left: 0;
		will-change: transform;
	}
`

export const ZVirtualList = c(
	(props) => {
		const host = useHost()
		const sizerRef = useRef<HTMLDivElement>()
		const winRef = useRef<HTMLDivElement>()

		useEffect(() => {
			const scroller = host.current as HTMLElement
			const win = winRef.current as HTMLElement
			const sizer = sizerRef.current as HTMLElement
			if (!win || !sizer) return

			const items: unknown[] = Array.isArray(props.items) ? (props.items as unknown[]) : []
			const n = items.length
			const gap = (props.gap as number) || 0
			const overscan = (props.overscan as number) ?? 4
			const horizontal = Boolean(props.isHorizontal)
			const render = props.renderItem as ((item: unknown, i: number) => Node | string) | undefined

			// Dynamic sizing kicks in only when an estimate is given and no fixed
			// height is set — otherwise we keep the proven fixed fast path.
			const fixedH = props.itemHeight as number | undefined
			const dynamic = !fixedH && props.estimateSize != null
			const estimate = (props.estimateSize as number) || fixedH || 40
			const rowSize = (fixedH || 40) + gap // fixed-mode stride

			win.style.width = horizontal ? 'auto' : '100%'
			win.style.height = horizontal ? '100%' : 'auto'
			win.style.whiteSpace = horizontal ? 'nowrap' : 'normal'

			const sizeOf = (el: HTMLElement) => (horizontal ? el.offsetWidth : el.offsetHeight)
			const setSizerExtent = (px: number) =>
				(sizer.style[horizontal ? 'width' : 'height'] = `${Math.max(0, px)}px`)
			const translate = (px: number) =>
				(win.style.transform = horizontal ? `translateX(${px}px)` : `translateY(${px}px)`)

			// ── dynamic-mode measurement cache ──────────────────────────────────
			// measured[i] = real size (px) or -1 when still an estimate.
			// offset[i] = running top of row i; offset[n] = total extent.
			const measured: number[] = new Array(n).fill(-1)
			const offset: number[] = new Array(n + 1)
			const sizeAt = (i: number) => (measured[i] >= 0 ? measured[i] : estimate) + gap
			const rebuildFrom = (from: number) => {
				if (from <= 0) offset[0] = 0
				for (let i = Math.max(0, from); i < n; i++) offset[i + 1] = offset[i] + sizeAt(i)
			}
			if (dynamic) rebuildFrom(0)

			// largest i with offset[i] <= scroll (start of the visible window)
			const findStart = (scroll: number) => {
				let lo = 0
				let hi = n
				while (lo < hi) {
					const mid = (lo + hi + 1) >> 1
					if (offset[mid] <= scroll) lo = mid
					else hi = mid - 1
				}
				return lo
			}

			if (dynamic) setSizerExtent(offset[n] - gap)
			else setSizerExtent(n * rowSize - gap)

			let lastStart = -1
			let lastEnd = -1

			const renderWindow = () => {
				const vp = horizontal ? scroller.clientWidth : scroller.clientHeight
				const scroll = horizontal ? scroller.scrollLeft : scroller.scrollTop

				let start: number
				let end: number
				if (dynamic) {
					start = Math.max(0, findStart(scroll) - overscan)
					end = start
					const bottom = scroll + vp
					while (end < n && offset[end] < bottom) end++
					end = Math.min(n, end + overscan)
				} else {
					start = Math.max(0, Math.floor(scroll / rowSize) - overscan)
					end = Math.min(n, start + Math.ceil(vp / rowSize) + overscan * 2)
				}
				if (start === lastStart && end === lastEnd) return
				lastStart = start
				lastEnd = end

				translate(dynamic ? offset[start] : start * rowSize)

				const frag = document.createDocumentFragment()
				const wraps: HTMLElement[] = []
				for (let i = start; i < end; i++) {
					const wrap = document.createElement('div')
					if (dynamic) {
						// let content dictate size; only pad the inter-row gap
						if (gap) wrap.style[horizontal ? 'marginRight' : 'marginBottom'] = `${gap}px`
						if (horizontal) wrap.style.display = 'inline-block'
					} else {
						wrap.style[horizontal ? 'width' : 'height'] = `${fixedH || 40}px`
						if (gap) wrap.style[horizontal ? 'marginRight' : 'marginBottom'] = `${gap}px`
						if (horizontal) wrap.style.display = 'inline-block'
					}
					const out = render ? render(items[i], i) : null
					if (typeof out === 'string') wrap.innerHTML = out
					else if (out instanceof Node) wrap.appendChild(out)
					frag.appendChild(wrap)
					wraps.push(wrap)
				}
				win.replaceChildren(frag)

				// Measure what we just painted. Only rows >= start are ever measured,
				// so offset[start] never shifts underneath us → no scroll jump.
				if (dynamic && wraps.length) {
					let firstChanged = Infinity
					for (let k = 0; k < wraps.length; k++) {
						const i = start + k
						const h = sizeOf(wraps[k])
						if (measured[i] !== h) {
							measured[i] = h
							if (i < firstChanged) firstChanged = i
						}
					}
					if (firstChanged !== Infinity) {
						rebuildFrom(firstChanged)
						setSizerExtent(offset[n] - gap)
						translate(offset[start])
					}
				}

				props.visiblerangechange({ start, end })
			}

			renderWindow()

			let ticking = false
			const onScroll = () => {
				if (ticking) return
				ticking = true
				requestAnimationFrame(() => {
					ticking = false
					renderWindow()
				})
			}
			scroller.addEventListener('scroll', onScroll, { passive: true })
			const ro = new ResizeObserver(() => {
				lastStart = lastEnd = -1 // force recompute on viewport resize
				renderWindow()
			})
			ro.observe(scroller)

			// ── imperative API ──────────────────────────────────────────────────
			const posOf = (i: number) => (dynamic ? offset[i] : i * rowSize)
			const sizeOfIndex = (i: number) => (dynamic ? sizeAt(i) - gap : fixedH || 40)
			const api = scroller as any
			api.scrollToIndex = (i: number, align: 'start' | 'center' | 'end' = 'start') => {
				const pos = posOf(i)
				const vp = horizontal ? scroller.clientWidth : scroller.clientHeight
				const target =
					align === 'center'
						? pos - vp / 2 + sizeOfIndex(i) / 2
						: align === 'end'
							? pos - vp + sizeOfIndex(i)
							: pos
				scroller[horizontal ? 'scrollLeft' : 'scrollTop'] = Math.max(0, target)
			}
			api.scrollToTop = () => (scroller[horizontal ? 'scrollLeft' : 'scrollTop'] = 0)
			api.scrollToBottom = () =>
				(scroller[horizontal ? 'scrollLeft' : 'scrollTop'] = horizontal
					? scroller.scrollWidth
					: scroller.scrollHeight)
			api.getVisibleRange = () => ({ start: lastStart, end: lastEnd })

			return () => {
				scroller.removeEventListener('scroll', onScroll)
				ro.disconnect()
			}
		}, [
			props.items,
			props.itemHeight,
			props.estimateSize,
			props.gap,
			props.overscan,
			props.isHorizontal,
			props.renderItem
		])

		return (
			<host shadowDom>
				<div class='sizer' ref={sizerRef}>
					<div class='window' ref={winRef} />
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
			visiblerangechange: event<{ start: number; end: number }>({
				bubbles: true,
				composed: true
			})
		},
		styles: [themedScrollbarStyles, styles]
	}
)

customElements.define('z-virtual-list', ZVirtualList)
