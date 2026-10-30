/*
 * Exit presence: keep an element rendered while its exit transition plays,
 * then finish it off (close a <dialog>, hide a [popover], unmount a toast).
 *
 * runExit(el, finish) flags el with data-state="closing", the stylesheet's
 * cue to transition to its hidden state, and calls `finish` once that
 * transition ends. cancelExit(el) aborts a pending exit, so reopening
 * mid-exit reverses smoothly from wherever the transition currently is.
 */

const pending = new WeakMap<Element, () => void>()

/** Longest `duration + delay` across the element's current transitions, in ms. */
export const transitionMs = (el: Element): number => {
	const style = getComputedStyle(el)
	const toMs = (v: string) => (v.trim().endsWith('ms') ? parseFloat(v) : parseFloat(v) * 1000) || 0
	const durations = style.transitionDuration.split(',').map(toMs)
	const delays = style.transitionDelay.split(',').map(toMs)
	return Math.max(0, ...durations.map((d, i) => d + (delays[i % delays.length] ?? 0)))
}

export const cancelExit = (el: Element): void => {
	pending.get(el)?.()
	pending.delete(el)
}

export const isExiting = (el: HTMLElement): boolean => el.dataset.state === 'closing'

export const runExit = (el: HTMLElement, finish: () => void): void => {
	if (isExiting(el)) return
	cancelExit(el)
	el.dataset.state = 'closing'

	let timer: ReturnType<typeof setTimeout>
	const done = () => {
		cancel()
		delete el.dataset.state
		finish()
	}
	const onEnd = (e: Event) => {
		if (e.target === el && (e as TransitionEvent).propertyName === 'opacity') done()
	}
	const cancel = () => {
		clearTimeout(timer)
		el.removeEventListener('transitionend', onEnd)
		pending.delete(el)
	}

	el.addEventListener('transitionend', onEnd)
	// transitionend never fires when nothing actually transitions (styles set
	// to `transition: none`, a hidden tab), so always back it with a timer.
	timer = setTimeout(done, transitionMs(el) + 34)
	pending.set(el, cancel)
}

/** Flip el into its open state from the hidden one, committing the hidden
 *  styles first so the browser has something to transition from. */
export const runEnter = (el: HTMLElement): void => {
	cancelExit(el)
	if (el.dataset.state === 'open') return
	void el.offsetWidth
	el.dataset.state = 'open'
}
