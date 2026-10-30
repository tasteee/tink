import { c, css, useEffect, useHost, useState } from 'atomico'

/*
 * Toasts. Call the `toaster` singleton from anywhere; a <z-toaster> region
 * renders them (one is created on <body> automatically if the page has none,
 * place your own to choose `position`).
 *
 *   const hide = toaster.show('Changes saved')       // a string is the title, and the id
 *   toaster.show({ id: 'upload', title: 'Uploading…', duration: Infinity })
 *   toaster.show({ id: 'upload', title: 'Uploaded', tone: 'success' })   // same id → updates in place
 *   hide()                                            // hides the toast that show() returned it for
 *   toaster.hide('upload')                            // or by id ({ id } works too)
 *   toaster.clear()                                   // everything
 *
 * Rules:
 *  - one toast per id. Showing an id that's already up updates that toast and
 *    restarts its countdown instead of stacking a duplicate. A string toast's
 *    id is the string itself, so repeated `show('Saved')` never piles up.
 *  - objects without an id get a unique one, so identical content with
 *    different settings stacks normally.
 *  - `duration` is ms (default 4000). `Infinity` (or 0) keeps it until hidden.
 *  - countdowns pause while the stack is hovered or focused, and while the tab
 *    is hidden.
 *  - if several regions are connected, the most recently connected one renders
 *    the stack (the others stay empty), so toasts never show twice. Timed toasts show the remaining time as a ring around the close
 *    button.
 */

export type ToastToneT = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export type ToastOptionsT = {
	id?: string
	title?: string
	description?: string
	tone?: ToastToneT
	/** ms until it hides itself; Infinity or 0 keeps it up until hidden */
	duration?: number
}

export type ToastT = {
	id: string
	title?: string
	description?: string
	tone: ToastToneT
	duration: number
	/** bumped on every show() of this id, restarts the countdown ring */
	version: number
	state: 'open' | 'closing'
}

export type HideToastT = (() => void) & { id: string }

const DEFAULT_DURATION = 4000
// keep in step with the .item exit transition below
const EXIT_MS = 200

const isTimed = (duration: number) => duration > 0 && Number.isFinite(duration)

/* ── store ──────────────────────────────────────────────────────────────── */

type TimerT = { handle?: ReturnType<typeof setTimeout>; remaining: number; startedAt: number }

let toasts: ToastT[] = []
let counter = 0
let isPaused = false
const timers = new Map<string, TimerT>()
const removals = new Map<string, ReturnType<typeof setTimeout>>()
const listeners = new Set<() => void>()
// connected regions, oldest first; only the newest renders the stack
const regions: HTMLElement[] = []

const emit = () => listeners.forEach((listener) => listener())

const startTimer = (id: string, ms: number) => {
	const timer: TimerT = { remaining: ms, startedAt: Date.now() }
	if (!isPaused) timer.handle = setTimeout(() => hide(id), ms)
	timers.set(id, timer)
}

const stopTimer = (id: string) => {
	clearTimeout(timers.get(id)?.handle)
	timers.delete(id)
}

const ensureRegion = () => {
	if (typeof document === 'undefined' || regions.length || document.querySelector('z-toaster')) return
	document.body.append(document.createElement('z-toaster'))
}

const show = (input: string | ToastOptionsT): HideToastT => {
	const options: ToastOptionsT = typeof input === 'string' ? { id: input, title: input } : input
	const id = options.id ?? `toast-${++counter}`
	const duration = options.duration === 0 ? Infinity : (options.duration ?? DEFAULT_DURATION)
	const existing = toasts.find((toast) => toast.id === id)

	clearTimeout(removals.get(id))
	removals.delete(id)
	stopTimer(id)

	const next: ToastT = {
		id,
		title: options.title,
		description: options.description,
		tone: options.tone ?? 'neutral',
		duration,
		version: (existing?.version ?? 0) + 1,
		state: 'open'
	}
	toasts = existing ? toasts.map((toast) => (toast.id === id ? next : toast)) : [...toasts, next]
	if (isTimed(duration)) startTimer(id, duration)

	ensureRegion()
	emit()
	return Object.assign(() => hide(id), { id })
}

const hide = (target: string | { id: string }): void => {
	const id = typeof target === 'string' ? target : target.id
	const toast = toasts.find((t) => t.id === id)
	if (!toast || toast.state === 'closing') return
	stopTimer(id)
	toasts = toasts.map((t) => (t.id === id ? { ...t, state: 'closing' } : t))
	emit()
	// the region keeps it rendered (is-closing) for the exit, then it's gone
	removals.set(
		id,
		setTimeout(() => {
			removals.delete(id)
			toasts = toasts.filter((t) => t.id !== id)
			emit()
		}, EXIT_MS)
	)
}

const clear = (): void => {
	toasts.forEach((toast) => hide(toast.id))
}

/** Freeze every countdown (hover / focus / hidden tab), or resume them. */
const setPaused = (paused: boolean): void => {
	if (paused === isPaused) return
	isPaused = paused
	timers.forEach((timer, id) => {
		if (paused) {
			clearTimeout(timer.handle)
			timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt))
		} else {
			timer.startedAt = Date.now()
			timer.handle = setTimeout(() => hide(id), timer.remaining)
		}
	})
	emit()
}

if (typeof document !== 'undefined') {
	document.addEventListener('visibilitychange', () => setPaused(document.visibilityState === 'hidden'))
}

export const toaster = {
	show,
	hide,
	clear,
	/** current toasts, oldest first (read-only snapshot) */
	get toasts(): readonly ToastT[] {
		return toasts
	}
}

/* ── region ─────────────────────────────────────────────────────────────── */

const styles = css`
	:host {
		position: fixed;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		width: min(22rem, calc(100vw - 2rem));
		pointer-events: none;
	}

	:host(:not([position])),
	:host([position='bottom-end']) {
		bottom: 1.25rem;
		right: 1.25rem;
	}
	:host([position='bottom-start']) {
		bottom: 1.25rem;
		left: 1.25rem;
	}
	:host([position='bottom-center']) {
		bottom: 1.25rem;
		left: 50%;
		transform: translateX(-50%);
	}
	:host([position='top-end']) {
		top: 1.25rem;
		right: 1.25rem;
	}
	:host([position='top-start']) {
		top: 1.25rem;
		left: 1.25rem;
	}
	:host([position='top-center']) {
		top: 1.25rem;
		left: 50%;
		transform: translateX(-50%);
	}

	/* Each toast sits in a collapsible row: on exit the row's height folds to
	   zero (grid 1fr → 0fr) while the toast fades and shrinks, so the rest of
	   the stack glides into place instead of jumping. */
	.item {
		display: grid;
		grid-template-rows: 1fr;
		padding-top: 0.625rem;
		transition:
			grid-template-rows var(--motion-exit-base) var(--ease-move),
			padding var(--motion-exit-base) var(--ease-move);
	}

	:host([position^='top']) .item {
		padding-top: 0;
		padding-bottom: 0.625rem;
	}

	.item.is-closing {
		overflow: hidden;
		grid-template-rows: 0fr;
		padding-top: 0;
		padding-bottom: 0;
		transition-delay: 60ms;
	}

	.toast {
		--travel: calc(var(--motion-distance-md) * var(--motion-travel));
		min-height: 0;
		pointer-events: auto;
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		box-sizing: border-box;
		padding: 0.75rem 0.75rem 0.75rem 0.875rem;
		color: var(--foreground);
		background: var(--popover);
		border: 1px solid var(--border);
		border-left: 2px solid var(--toast-accent, var(--border));
		border-radius: var(--radius-md);
		overflow: hidden;
		animation: toast-in var(--motion-base) var(--ease-enter);
		transition:
			opacity var(--motion-exit-base) var(--ease-exit),
			scale var(--motion-exit-base) var(--ease-exit);
	}

	:host([position^='top']) .toast {
		--travel: calc(var(--motion-distance-md) * -1 * var(--motion-travel));
	}

	.is-closing .toast {
		opacity: 0;
		scale: var(--motion-scale-from);
	}

	/* a toned toast washes the faintest tint of its tone in from the accent edge */
	.toast:not(.is-neutral) {
		background: linear-gradient(
			100deg,
			color-mix(in oklch, var(--toast-accent) 10%, var(--popover)) 0%,
			var(--popover) 58%
		);
	}

	.toast.is-info {
		--toast-accent: var(--purple);
	}
	.toast.is-success {
		--toast-accent: var(--success);
	}
	.toast.is-warning {
		--toast-accent: var(--warning);
	}
	.toast.is-danger {
		--toast-accent: var(--destructive);
	}

	@keyframes toast-in {
		from {
			opacity: 0;
			translate: 0 var(--travel);
			scale: var(--motion-scale-from);
		}
	}

	.content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding-top: 0.25rem;
	}

	.title {
		font-size: var(--font-size-small);
		font-weight: 600;
		color: var(--foreground);
		line-height: 1.4;
	}

	.description {
		font-size: var(--font-size-caption);
		color: var(--muted-foreground);
		line-height: var(--line-height-body);
	}

	/* close button, ringed by the remaining-time indicator on timed toasts */
	.close {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		flex-shrink: 0;
		padding: 0;
		background: transparent;
		border: 0;
		border-radius: 999px;
		color: var(--muted-foreground);
		cursor: pointer;
		transition:
			color var(--motion-fast) var(--ease-enter),
			background-color var(--motion-fast) var(--ease-enter);
	}

	.close:hover {
		color: var(--foreground);
		background: color-mix(in oklch, var(--foreground) 8%, transparent);
	}

	.close:focus-visible {
		outline: 2px solid color-mix(in oklch, var(--ring) 60%, transparent);
		outline-offset: 1px;
	}

	.close .x {
		width: 0.875rem;
		height: 0.875rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		fill: none;
	}

	.ring {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		rotate: -90deg;
		fill: none;
		pointer-events: none;
	}

	.ring circle {
		stroke-width: 1.5;
	}

	.ring .track {
		stroke: color-mix(in oklch, var(--foreground) 8%, transparent);
	}

	/* pathLength=100: the arc drains from full to nothing over the duration */
	.ring .remaining {
		stroke: color-mix(in oklch, var(--toast-accent, var(--muted-foreground)) 85%, transparent);
		stroke-dasharray: 100;
		stroke-linecap: round;
		animation: toast-countdown linear forwards;
	}

	:host([data-paused]) .ring .remaining {
		animation-play-state: paused;
	}

	@keyframes toast-countdown {
		to {
			stroke-dashoffset: 100;
		}
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
`

export const ZToaster = c(
	() => {
		const host = useHost()
		const [snapshot, setSnapshot] = useState<{ toasts: ToastT[]; isPaused: boolean }>({ toasts: [], isPaused })

		useEffect(() => {
			const el = host.current as HTMLElement
			const sync = () => setSnapshot({ toasts: regions[regions.length - 1] === el ? toasts : [], isPaused })
			regions.push(el)
			listeners.add(sync)
			emit()
			return () => {
				regions.splice(regions.indexOf(el), 1)
				listeners.delete(sync)
				emit()
			}
		}, [])

		const pause = () => setPaused(true)
		const resume = (e: Event) => {
			// stay paused while focus is still inside the stack
			const related = (e as FocusEvent).relatedTarget as Node | null
			if (related && (e.currentTarget as Node).contains(related)) return
			setPaused(document.visibilityState === 'hidden')
		}

		return (
			<host
				shadowDom
				role="region"
				aria-label="Notifications"
				data-paused={snapshot.isPaused ? '' : null}
				onpointerenter={pause}
				onpointerleave={resume}
				onfocusin={pause}
				onfocusout={resume}
			>
				{snapshot.toasts.map((toast) => (
					<div key={toast.id} class={toast.state === 'closing' ? 'item is-closing' : 'item'}>
						<div
							class={`toast is-${toast.tone}`}
							role={toast.tone === 'danger' ? 'alert' : 'status'}
							aria-live={toast.tone === 'danger' ? 'assertive' : 'polite'}
						>
							<div class="content">
								{toast.title && <span class="title">{toast.title}</span>}
								{toast.description && <span class="description">{toast.description}</span>}
							</div>
							<button type="button" class="close" aria-label="Dismiss notification" onclick={() => hide(toast.id)}>
								{isTimed(toast.duration) && [
									// keyed by version so an update in place restarts the countdown
									<svg key={`ring-${toast.version}`} class="ring" viewBox="0 0 28 28" aria-hidden="true">
										<circle class="track" cx="14" cy="14" r="13" />
										<circle
											class="remaining"
											cx="14"
											cy="14"
											r="13"
											pathLength="100"
											style={{ animationDuration: `${toast.duration}ms` }}
										/>
									</svg>
								]}
								<svg class="x" viewBox="0 0 24 24" aria-hidden="true">
									<line x1="6" y1="6" x2="18" y2="18" />
									<line x1="18" y1="6" x2="6" y2="18" />
								</svg>
							</button>
						</div>
					</div>
				))}
			</host>
		)
	},
	{
		props: {
			position: { type: String, reflect: true }
		},
		styles
	}
)

customElements.define('z-toaster', ZToaster)
