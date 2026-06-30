import { c, css, event, useHost, useState, useEffect } from 'atomico'

/*
 * z-range — a single slider bar with two handles. z-range owns the domain
 * (min/max/step); its two z-range-handle children own their value plus an
 * optional explicit min/max that clamps how far each handle can travel (and is
 * itself clamped to the domain). The handles can never cross — the left value
 * stays strictly below the right value.
 *
 * The track paints three states:
 *   • off-limits caps — the ends no handle can ever reach, driven only by the
 *     OUTER bounds (left handle's min, right handle's max). These collapse to
 *     nothing when those bounds are inherited from the domain, so an
 *     unconstrained range renders as an ordinary two-tone slider.
 *   • rail — reachable but unselected track.
 *   • active range — the accent fill between the two handles.
 *
 * Both handles are native input[type=range] overlaid on the same track (so
 * keyboard + a11y come for free), spanning the domain so they share one
 * coordinate system. A merged `input`/`change` event carrying { left, right }
 * is emitted, and each handle's live value is mirrored back onto its element.
 */
const styles = css`
	:host {
		display: block;
		width: 100%;
		--accent: var(--primary);
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([is-disabled]) {
		opacity: 0.5;
		pointer-events: none;
	}

	::slotted(*) {
		display: none;
	}

	.rail {
		position: relative;
		display: flex;
		align-items: center;
		height: 1rem;
		width: 100%;
	}

	/* Layered track segments — all non-interactive. */
	.track,
	.cap,
	.fill {
		position: absolute;
		height: 4px;
		border-radius: 999px;
		pointer-events: none;
	}
	/* reachable but unselected */
	.track {
		left: 0;
		right: 0;
		background: var(--border);
		z-index: 1;
	}
	/* off-limits ends — clearly distinct from both rail and active range */
	.cap {
		background: color-mix(in oklch, var(--muted-foreground) 32%, transparent);
		z-index: 2;
	}
	/* active range between the handles */
	.fill {
		background: var(--accent);
		z-index: 3;
	}

	/* Two inputs share the track; only the thumbs take pointer events so either
	   handle can be grabbed independently. */
	input {
		position: absolute;
		left: 0;
		right: 0;
		width: 100%;
		height: 1rem;
		margin: 0;
		appearance: none;
		background: transparent;
		pointer-events: none;
	}
	input.left {
		z-index: 4;
	}
	input.right {
		z-index: 5;
	}
	input:focus-visible,
	input:active {
		z-index: 6;
	}

	input::-webkit-slider-runnable-track {
		height: 4px;
		background: transparent;
	}
	input::-moz-range-track {
		height: 4px;
		background: transparent;
	}
	input::-moz-range-progress {
		background: transparent;
	}

	input::-webkit-slider-thumb {
		pointer-events: auto;
		appearance: none;
		width: 1rem;
		height: 1rem;
		margin-top: -6px;
		border-radius: 999px;
		border: 2px solid var(--background);
		cursor: pointer;
		transition: transform 0.1s ease;
	}
	input::-moz-range-thumb {
		pointer-events: auto;
		width: 1rem;
		height: 1rem;
		border-radius: 999px;
		border: 2px solid var(--background);
		cursor: pointer;
	}
	input:active::-webkit-slider-thumb {
		transform: scale(1.15);
	}

	input.left::-webkit-slider-thumb {
		background: var(--left-accent, var(--accent));
	}
	input.left::-moz-range-thumb {
		background: var(--left-accent, var(--accent));
	}
	input.right::-webkit-slider-thumb {
		background: var(--right-accent, var(--accent));
	}
	input.right::-moz-range-thumb {
		background: var(--right-accent, var(--accent));
	}

	input:focus-visible::-webkit-slider-thumb {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}
	input:focus-visible::-moz-range-thumb {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}
`

type HandleElementT = HTMLElement & {
	value?: number
	min?: number
	max?: number
	step?: number
	tone?: string
}

type RangeDetailT = { left: number; right: number }

type ConfigT = {
	domainMin: number
	domainMax: number
	leftMin: number
	leftMax: number
	leftStep: number
	leftAccent: string
	rightMin: number
	rightMax: number
	rightStep: number
	rightAccent: string
}

const num = (value: unknown, fallback: number): number => {
	// Guard against Number(null) === 0 and Number('') === 0 — an absent attribute
	// must fall back, not read as zero.
	if (value === null || value === undefined || value === '') return fallback
	const n = Number(value)
	return Number.isFinite(n) ? n : fallback
}

const clamp = (value: number, lo: number, hi: number): number => Math.min(Math.max(value, lo), hi)

const accentFor = (tone: unknown): string =>
	tone === 'primary' ? 'var(--purple)' : tone === 'secondary' ? 'var(--pink)' : 'var(--primary)'

export const ZRange = c(
	(props) => {
		const host = useHost()
		const [config, setConfig] = useState<ConfigT | null>(null)
		const [leftValue, setLeftValue] = useState(0)
		const [rightValue, setRightValue] = useState(0)

		// Read the domain + the two handle children once, then drive from state.
		useEffect(() => {
			const handles = host.current.querySelectorAll<HandleElementT>('z-range-handle')
			if (handles.length < 2) return

			const domainMin = num(props.min, 0)
			const domainMax = num(props.max, 100)
			const domainStep = num(props.step, 1) || 1

			const read = (el: HandleElementT) => {
				const min = clamp(num(el.min ?? el.getAttribute('min'), domainMin), domainMin, domainMax)
				const max = clamp(num(el.max ?? el.getAttribute('max'), domainMax), domainMin, domainMax)
				const step = num(el.step ?? el.getAttribute('step'), domainStep) || domainStep
				const value = clamp(num(el.value ?? el.getAttribute('value'), domainMin), min, max)
				return { min, max, step, value, accent: accentFor(el.tone ?? el.getAttribute('tone')) }
			}

			const left = read(handles[0])
			const right = read(handles[1])

			// Guarantee the handles start uncrossed (left strictly below right).
			let lv = left.value
			let rv = right.value
			if (lv >= rv) lv = Math.max(left.min, rv - left.step)

			setConfig({
				domainMin,
				domainMax,
				leftMin: left.min,
				leftMax: left.max,
				leftStep: left.step,
				leftAccent: left.accent,
				rightMin: right.min,
				rightMax: right.max,
				rightStep: right.step,
				rightAccent: right.accent
			})
			setLeftValue(lv)
			setRightValue(rv)
			handles[0].value = lv
			handles[1].value = rv
		}, [])

		if (!config) {
			return (
				<host shadowDom>
					<slot />
				</host>
			)
		}

		const span = config.domainMax - config.domainMin || 1
		const toPct = (value: number) => ((value - config.domainMin) / span) * 100

		// Off-limits caps come ONLY from the outer bounds: the farthest left the
		// left handle can reach, and the farthest right the right handle can reach.
		const leftCapWidth = toPct(config.leftMin)
		const rightCapWidth = 100 - toPct(config.rightMax)
		const leftPct = toPct(leftValue)
		const rightPct = toPct(rightValue)

		// Returns the clamped value of the handle that moved so the caller can snap
		// the native input's live `.value` synchronously — otherwise the browser
		// keeps dragging the thumb past its bound while only the state is clamped.
		const commit = (input: HTMLInputElement, which: 'left' | 'right', kind: 'input' | 'change'): number => {
			const raw = Number(input.value)
			let nextLeft = leftValue
			let nextRight = rightValue

			if (which === 'left') {
				nextLeft = clamp(raw, config.leftMin, config.leftMax)
				// Can't reach the right handle — stop one step below it.
				if (nextLeft >= nextRight) nextLeft = Math.max(nextRight - config.leftStep, config.leftMin)
			} else {
				nextRight = clamp(raw, config.rightMin, config.rightMax)
				// Can't reach the left handle — stop one step above it.
				if (nextRight <= nextLeft) nextRight = Math.min(nextLeft + config.rightStep, config.rightMax)
			}

			setLeftValue(nextLeft)
			setRightValue(nextRight)

			const handles = host.current.querySelectorAll<HandleElementT>('z-range-handle')
			if (handles[0]) handles[0].value = nextLeft
			if (handles[1]) handles[1].value = nextRight

			const moved = which === 'left' ? nextLeft : nextRight
			// Snap the live thumb to the clamped value immediately.
			input.value = String(moved)

			const detail: RangeDetailT = { left: nextLeft, right: nextRight }
			if (kind === 'input') props.input(detail)
			else props.change(detail)

			return moved
		}

		return (
			<host
				shadowDom
				role="group"
				style={{ '--left-accent': config.leftAccent, '--right-accent': config.rightAccent }}
			>
				<div class="rail">
					<div class="track" />
					<div class="cap" style={{ left: '0', width: `${leftCapWidth}%` }} />
					<div class="cap" style={{ right: '0', width: `${rightCapWidth}%` }} />
					<div class="fill" style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }} />
					<input
						class="left"
						type="range"
						min={config.domainMin}
						max={config.domainMax}
						step={config.leftStep}
						value={leftValue}
						disabled={props.isDisabled}
						aria-label="Lower value"
						oninput={(e: any) => commit(e.target, 'left', 'input')}
						onchange={(e: any) => commit(e.target, 'left', 'change')}
					/>
					<input
						class="right"
						type="range"
						min={config.domainMin}
						max={config.domainMax}
						step={config.rightStep}
						value={rightValue}
						disabled={props.isDisabled}
						aria-label="Upper value"
						oninput={(e: any) => commit(e.target, 'right', 'input')}
						onchange={(e: any) => commit(e.target, 'right', 'change')}
					/>
				</div>
				<slot />
			</host>
		)
	},
	{
		props: {
			min: { type: Number, reflect: true },
			max: { type: Number, reflect: true },
			step: { type: Number, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			input: event<RangeDetailT>({ bubbles: true, composed: true }),
			change: event<RangeDetailT>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-range', ZRange)
