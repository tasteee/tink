import { c, css, useRef } from 'atomico'
import { resolveSize } from '../shared/layout-schema'

/*
 * z-dock — a macOS-style dock. Tracks the pointer over the strip and pushes
 * a per-item `--dock-scale` custom property onto each slotted z-dock-item,
 * scaled by linear falloff from cursor distance — the item itself just
 * renders `transform: scale(var(--dock-scale))` (see z-dock-item), so the
 * parent owns the physics and the child owns the paint. `floating` docks the
 * whole thing to the bottom-center of the viewport; otherwise it's an inline
 * strip you position yourself.
 */
const styles = css`
	:host {
		display: inline-flex;
		--dock-item-size: 3rem;
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([floating]) {
		position: fixed;
		bottom: 1.25rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 999;
	}

	.dock {
		display: flex;
		align-items: flex-end;
		gap: var(--dock-gap, 0.75rem);
		box-sizing: border-box;
		padding: 0.6rem;
		border-radius: var(--radius-xl);
		background: color-mix(in oklch, var(--popover) 85%, transparent);
		border: 1px solid var(--border);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}
`

export const ZDock = c(
	(props) => {
		const slotRef = useRef<HTMLSlotElement>()
		const rafRef = useRef<number>()

		const applyScale = (pointerX: number) => {
			const slot = slotRef.current as any
			if (!slot) return
			const maxScale = props.magnification || 1.7
			const reach = props.distance || 140
			const items: HTMLElement[] = slot.assignedElements()
			items.forEach((item) => {
				const rect = item.getBoundingClientRect()
				const center = rect.left + rect.width / 2
				const falloff = Math.max(0, 1 - Math.abs(pointerX - center) / reach)
				const scale = 1 + (maxScale - 1) * falloff
				item.style.setProperty('--dock-scale', scale.toFixed(3))
			})
		}

		const resetScale = () => {
			const slot = slotRef.current as any
			if (!slot) return
			const items: HTMLElement[] = slot.assignedElements()
			items.forEach((item) => item.style.setProperty('--dock-scale', '1'))
		}

		const handlePointerMove = (nativeEvent: PointerEvent) => {
			const pointerX = nativeEvent.clientX
			if (rafRef.current) return
			rafRef.current = requestAnimationFrame(() => {
				applyScale(pointerX)
				rafRef.current = undefined
			})
		}

		const hostStyle: Record<string, string> = {}
		if (props.itemSize) hostStyle['--dock-item-size'] = props.itemSize
		const gap = resolveSize(props.gap)
		if (gap) hostStyle['--dock-gap'] = gap

		return (
			<host shadowDom style={hostStyle} onpointermove={handlePointerMove} onpointerleave={resetScale}>
				<div class="dock">
					<slot ref={slotRef} />
				</div>
			</host>
		)
	},
	{
		props: {
			magnification: Number,
			distance: Number,
			itemSize: String,
			gap: String,
			floating: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-dock', ZDock)
