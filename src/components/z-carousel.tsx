import { c, css, event, useState, useEffect, useRef } from 'atomico'

/*
 * z-carousel — a one-per-view slider over slotted children. Each direct child is
 * a slide; the track translates by whole steps. Includes prev/next controls and
 * dot indicators, optional `loop`, and `autoplay` (ms between advances, paused
 * on hover/focus). Slide count is read from the slot, so markup stays declarative.
 * Fires `change` with { index } on every move.
 */
const styles = css`
	:host {
		display: block;
		position: relative;
		--accent: var(--color-neutral-8);
	}

	:host([tone='secondary']) {
		--accent: var(--pink);
	}

	:host([is-hidden]) {
		display: none;
	}

	.viewport {
		overflow: hidden;
		border-radius: var(--radius-lg);
	}

	.track {
		display: flex;
		transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
	}

	::slotted(*) {
		flex: 0 0 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 2;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 999px;
		background: color-mix(in oklch, var(--background) 70%, transparent);
		backdrop-filter: blur(8px);
		border: 1px solid var(--border);
		color: var(--foreground);
		cursor: pointer;
		transition:
			border-color 0.12s ease,
			background-color 0.12s ease,
			opacity 0.12s ease;
	}

	.btn:hover {
		border-color: var(--accent);
	}

	.btn:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	.btn:disabled {
		opacity: 0.35;
		cursor: default;
		pointer-events: none;
	}

	.btn.prev {
		left: 0.75rem;
	}
	.btn.next {
		right: 0.75rem;
	}

	.btn svg {
		width: 1.125rem;
		height: 1.125rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.dots {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.dot {
		width: 0.5rem;
		height: 0.5rem;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: var(--color-neutral-3);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			width 0.15s ease;
	}

	.dot:hover {
		background: var(--color-neutral-4);
	}

	.dot.is-active {
		background: var(--accent);
		width: 1.25rem;
	}

	.dot:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}
`

export const ZCarousel = c(
	(props) => {
		const [index, setIndex] = useState(0)
		const [count, setCount] = useState(0)
		const paused = useRef(false)

		const safeIndex = count > 0 ? Math.min(index, count - 1) : 0

		const go = (next: number) => {
			if (count === 0) return
			let target = next
			if (props.loop) target = (next + count) % count
			else target = Math.max(0, Math.min(next, count - 1))
			setIndex(target)
			props.change({ index: target })
		}

		const interval = typeof props.autoplay === 'number' ? props.autoplay : 0
		useEffect(() => {
			if (interval <= 0 || count <= 1) return
			const id = setInterval(() => {
				if (paused.current) return
				setIndex((prev) => {
					const next = props.loop ? (prev + 1) % count : prev + 1 >= count ? 0 : prev + 1
					props.change({ index: next })
					return next
				})
			}, interval)
			return () => clearInterval(id)
		}, [interval, count, props.loop])

		const atStart = !props.loop && safeIndex === 0
		const atEnd = !props.loop && safeIndex >= count - 1

		return (
			<host
				shadowDom
				onpointerenter={() => (paused.current = true)}
				onpointerleave={() => (paused.current = false)}
				onfocusin={() => (paused.current = true)}
				onfocusout={() => (paused.current = false)}
			>
				<div class='viewport'>
					<div class='track' style={{ transform: `translateX(-${safeIndex * 100}%)` }}>
						<slot onslotchange={(e: Event) => setCount((e.target as HTMLSlotElement).assignedElements().length)} />
					</div>
				</div>

				{count > 1 && (
					<>
						<button
							type='button'
							class='btn prev'
							aria-label='Previous slide'
							disabled={atStart}
							onclick={() => go(safeIndex - 1)}
						>
							<svg viewBox='0 0 24 24'>
								<polyline points='15 18 9 12 15 6' />
							</svg>
						</button>
						<button type='button' class='btn next' aria-label='Next slide' disabled={atEnd} onclick={() => go(safeIndex + 1)}>
							<svg viewBox='0 0 24 24'>
								<polyline points='9 18 15 12 9 6' />
							</svg>
						</button>
						<div class='dots'>
							{Array.from({ length: count }).map((_, i) => (
								<button
									key={i}
									type='button'
									class={i === safeIndex ? 'dot is-active' : 'dot'}
									aria-label={`Go to slide ${i + 1}`}
									aria-current={i === safeIndex ? 'true' : 'false'}
									onclick={() => go(i)}
								/>
							))}
						</div>
					</>
				)}
			</host>
		)
	},
	{
		props: {
			autoplay: { type: Number },
			loop: { type: Boolean, reflect: true },
			tone: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ index: number }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-carousel', ZCarousel)
