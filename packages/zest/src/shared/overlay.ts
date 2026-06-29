/*
 * Shared overlay positioning + lifecycle helpers, used by every floating
 * z-* component (z-popover, z-tooltip, z-hover-card, and the dialog family).
 * The goal is one consistent anchoring strategy so all overlays flip, shift,
 * and reposition identically — the floating counterpart to the shared
 * box-schema / toggle-styles modules.
 *
 * Strategy:
 *  - Top layer is delegated to the platform: floating panels use the Popover
 *    API ([popover]) and modal surfaces use <dialog>.showModal(). That gives
 *    us free stacking-context escape, light-dismiss, Esc handling, and (for
 *    dialogs) focus trapping without re-implementing any of it.
 *  - Anchored positioning is done in JS here (computePosition + autoUpdate),
 *    because the CSS Anchor API isn't broadly available yet. The math mirrors
 *    a tiny subset of Floating UI: place on a side, align on the cross axis,
 *    flip when the preferred side overflows, then shift to stay on screen.
 */

export type Side = 'top' | 'bottom' | 'left' | 'right'
export type Align = 'start' | 'center' | 'end'
export type Placement = Side | `${Side}-${Align}`

export interface PositionOptions {
	placement?: Placement
	/** gap in px between the anchor edge and the floating element */
	offset?: number
	/** min distance in px the floating element keeps from the viewport edges */
	padding?: number
}

export interface PositionResult {
	x: number
	y: number
	side: Side
	placement: Placement
}

const OPPOSITE: Record<Side, Side> = {
	top: 'bottom',
	bottom: 'top',
	left: 'right',
	right: 'left'
}

const parsePlacement = (placement: Placement): { side: Side; align: Align } => {
	const [side, align] = placement.split('-') as [Side, Align | undefined]
	return { side, align: align ?? 'center' }
}

/** Coordinate of the floating box for a given side, before cross-axis alignment. */
const coordsForSide = (side: Side, anchor: DOMRect, fw: number, fh: number, offset: number) => {
	switch (side) {
		case 'top':
			return { x: anchor.left, y: anchor.top - fh - offset }
		case 'bottom':
			return { x: anchor.left, y: anchor.bottom + offset }
		case 'left':
			return { x: anchor.left - fw - offset, y: anchor.top }
		case 'right':
			return { x: anchor.right + offset, y: anchor.top }
	}
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

export const computePosition = (anchor: Element, floating: HTMLElement, opts: PositionOptions = {}): PositionResult => {
	const { placement = 'bottom', offset = 8, padding = 8 } = opts
	const { side: prefSide, align } = parsePlacement(placement)

	const a = anchor.getBoundingClientRect()
	const fw = floating.offsetWidth
	const fh = floating.offsetHeight
	const vw = document.documentElement.clientWidth
	const vh = document.documentElement.clientHeight

	// flip to the opposite side when the preferred side has no room but the
	// opposite one does.
	let side = prefSide
	const fits = (s: Side): boolean => {
		const { x, y } = coordsForSide(s, a, fw, fh, offset)
		if (s === 'top') return y >= padding
		if (s === 'bottom') return y + fh <= vh - padding
		if (s === 'left') return x >= padding
		return x + fw <= vw - padding
	}
	if (!fits(prefSide) && fits(OPPOSITE[prefSide])) side = OPPOSITE[prefSide]

	let { x, y } = coordsForSide(side, a, fw, fh, offset)

	// cross-axis alignment
	if (side === 'top' || side === 'bottom') {
		if (align === 'center') x = a.left + (a.width - fw) / 2
		else if (align === 'end') x = a.right - fw
	} else {
		if (align === 'center') y = a.top + (a.height - fh) / 2
		else if (align === 'end') y = a.bottom - fh
	}

	// shift along the cross axis to keep the panel within the viewport
	if (side === 'top' || side === 'bottom') x = clamp(x, padding, Math.max(padding, vw - fw - padding))
	else y = clamp(y, padding, Math.max(padding, vh - fh - padding))

	return { x: Math.round(x), y: Math.round(y), side, placement: align === 'center' ? side : (`${side}-${align}` as Placement) }
}

/**
 * Keep `update` in sync while the overlay is open: reposition on scroll
 * (capture, so nested scrollers count), resize, and any size change of the
 * anchor or floating element. Returns a teardown to call when it closes.
 */
export const autoUpdate = (anchor: Element, floating: HTMLElement, update: () => void): (() => void) => {
	update()
	const onChange = () => update()
	window.addEventListener('scroll', onChange, true)
	window.addEventListener('resize', onChange)

	let ro: ResizeObserver | undefined
	if (typeof ResizeObserver !== 'undefined') {
		ro = new ResizeObserver(onChange)
		ro.observe(anchor)
		ro.observe(floating)
	}

	return () => {
		window.removeEventListener('scroll', onChange, true)
		window.removeEventListener('resize', onChange)
		ro?.disconnect()
	}
}

/**
 * Guarded Popover API toggles — showPopover/hidePopover throw if the element is
 * already in the requested state, so every caller would need the same matches()
 * check. Centralize it here.
 */
export const showFloating = (el: HTMLElement): void => {
	if (!el.matches(':popover-open')) el.showPopover()
}
export const hideFloating = (el: HTMLElement): void => {
	if (el.matches(':popover-open')) el.hidePopover()
}

/** Apply a PositionResult to a fixed-positioned floating element. */
export const applyPosition = (floating: HTMLElement, pos: PositionResult): void => {
	floating.style.left = `${pos.x}px`
	floating.style.top = `${pos.y}px`
	floating.dataset.side = pos.side
}

/** Shared prop surface for anchored overlays (placement / offset / tone). */
export const overlayPositionProps = {
	placement: { type: String, reflect: true },
	offset: { type: Number },
	tone: { type: String, reflect: true },
	isHidden: { type: Boolean, reflect: true }
}
