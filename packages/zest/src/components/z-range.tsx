import { interactionStyles } from '../shared/interaction-styles'
import { defineFormElement, useFormControl } from '../shared/form-control'
import { useLocale } from '../shared/locale'
import { c, css, event, useHost, useProp, useEffect, useRef } from 'atomico'

/*
 * z-range, one slider bar with two handles. It follows the array-property
 * pattern every other multi-value control uses:
 *
 *   range.value = [20, 80]
 *   range.handles = [{ label: 'Min price' }, { label: 'Max price', max: 90 }]
 *
 * z-range owns the domain (min / max / step). `value` is the [lower, upper]
 * pair. `handles` optionally configures each handle: a label, a tone, its own
 * step, and a min / max that limits how far it can travel (clamped to the
 * domain). The handles never cross: lower stays strictly below upper.
 *
 * The track paints three states:
 *   • off-limits caps, the ends no handle can reach, driven only by the OUTER
 *     bounds (lower handle's min, upper handle's max). They collapse to nothing
 *     when those bounds are the domain's, so an unconstrained range renders as
 *     an ordinary two-tone slider.
 *   • rail, reachable but unselected track.
 *   • active range, the tone fill between the two handles.
 *
 * Both handles are native input[type=range] overlaid on the same track, so
 * keyboard and a11y come from the platform. `input` / `change` carry
 * { value: [lower, upper] }.
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


	/* Header row: label left, value pill right. The two numbers in the pill are
	   tinted with their handle's tone, tying each bound to its thumb. */
	.header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		margin-bottom: 0.5rem;
	}

	.label {
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-medium);
		color: var(--foreground);
		line-height: 1.2;
	}

	.value {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		/* margin-left keeps the value flush-right even when there's no label. */
		margin-inline-start: auto;
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
		background: color-mix(in oklch, var(--muted-foreground) 12%, transparent);
		padding: 0.125rem 0.5rem;
		border-radius: 999px;
		line-height: 1.4;
		white-space: nowrap;
	}
	.value .left {
		color: var(--left-accent, var(--accent));
	}
	.value .right {
		color: var(--right-accent, var(--accent));
	}
	.value .dash {
		color: var(--muted-foreground);
		font-weight: var(--font-weight-regular);
	}

	.rail {
		position: relative;
		display: flex;
		align-items: center;
		height: 1rem;
		width: 100%;
	}

	/* Layered track segments, all non-interactive. */
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
	/* off-limits ends, clearly distinct from both rail and active range */
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
		transition: transform var(--motion-instant) var(--ease-enter);
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
		outline: 3px solid var(--focus-ring);
		outline-offset: 2px;
	}
	input:focus-visible::-moz-range-thumb {
		outline: 3px solid var(--focus-ring);
		outline-offset: 2px;
	}
`

export type RangeHandleT = {
	label?: string
	tone?: string
	min?: number
	max?: number
	step?: number
}

export type RangeValueT = [number, number]

type RangeDetailT = { value: RangeValueT }

type HandleConfigT = {
	min: number
	max: number
	step: number
	tone: string
	label: string
}

type ConfigT = {
	domainMin: number
	domainMax: number
	lower: HandleConfigT
	upper: HandleConfigT
}

const num = (value: unknown, fallback: number): number => {
	// Guard against Number(null) === 0 and Number('') === 0, an absent attribute
	// must fall back, not read as zero.
	if (value === null || value === undefined || value === '') return fallback
	const n = Number(value)
	return Number.isFinite(n) ? n : fallback
}

const clamp = (value: number, lo: number, hi: number): number => Math.min(Math.max(value, lo), hi)

const toneFor = (tone: unknown): string => {
	if (tone === 'primary') return 'var(--purple)'
	if (tone === 'secondary') return 'var(--pink)'
	if (tone === 'success') return 'var(--success)'
	if (tone === 'warning') return 'var(--warning)'
	if (tone === 'danger') return 'var(--destructive)'
	return 'var(--primary)'
}

const buildHandleConfig = (
	handle: RangeHandleT | undefined,
	domain: { min: number; max: number; step: number },
	fallbackLabel: string
): HandleConfigT => {
	const min = clamp(num(handle?.min, domain.min), domain.min, domain.max)
	const max = clamp(num(handle?.max, domain.max), domain.min, domain.max)
	const step = num(handle?.step, domain.step) || domain.step
	const tone = toneFor(handle?.tone)
	const label = handle?.label || fallbackLabel
	return { min, max, step, tone, label }
}

const buildConfig = (props: any, lowerLabel: string, upperLabel: string): ConfigT => {
	const domainMin = num(props.min, 0)
	const domainMax = num(props.max, 100)
	const domainStep = num(props.step, 1) || 1
	const domain = { min: domainMin, max: domainMax, step: domainStep }
	const handles: RangeHandleT[] = Array.isArray(props.handles) ? props.handles : []
	const lower = buildHandleConfig(handles[0], domain, lowerLabel)
	const upper = buildHandleConfig(handles[1], domain, upperLabel)
	return { domainMin, domainMax, lower, upper }
}

// Sorts a requested pair, clamps each end into its handle's bounds,
// and keeps the lower value strictly below the upper one.
const normalizeValue = (requested: unknown, config: ConfigT): RangeValueT => {
	const pair = Array.isArray(requested) ? requested : []
	const first = num(pair[0], config.lower.min)
	const second = num(pair[1], config.upper.max)
	const sortedLow = Math.min(first, second)
	const sortedHigh = Math.max(first, second)
	const upper = clamp(sortedHigh, config.upper.min, config.upper.max)
	const lowerRaw = clamp(sortedLow, config.lower.min, config.lower.max)
	const isCrossed = lowerRaw >= upper
	const lower = isCrossed ? Math.max(config.lower.min, upper - config.lower.step) : lowerRaw
	return [lower, upper]
}

const isSamePair = (first: unknown, second: RangeValueT): boolean => {
	const isPair = Array.isArray(first) && first.length === 2
	if (!isPair) return false
	return Number(first[0]) === second[0] && Number(first[1]) === second[1]
}

// A dragged handle stops one step short of the other one instead of
// pushing it along.
const normalizeUnlessCrossing = (requested: RangeValueT, which: 'lower' | 'upper', config: ConfigT): RangeValueT => {
	const isLower = which === 'lower'
	const lower = clamp(requested[0], config.lower.min, config.lower.max)
	const upper = clamp(requested[1], config.upper.min, config.upper.max)
	const isCrossed = lower >= upper
	if (!isCrossed) return [lower, upper]
	if (isLower) return [Math.max(upper - config.lower.step, config.lower.min), upper]
	return [lower, Math.min(lower + config.upper.step, config.upper.max)]
}

export const ZRange = c(
	(props) => {
		const host = useHost()
		const t = useLocale()
		const [requestedValue, setRequestedValue] = useProp<RangeValueT>('value')
		const config = buildConfig(props, t('lowerValue'), t('upperValue'))
		const value = normalizeValue(requestedValue, config)
		const lowerValue = value[0]
		const upperValue = value[1]
		const defaultValue = useRef<RangeValueT | null>(null)
		const lowerInputRef = useRef<HTMLInputElement>()

		if (defaultValue.current === null) defaultValue.current = value

		// Reflect the normalized pair, so `value` always reads back as
		// what the handles show.
		useEffect(() => {
			const isAlreadyNormalized = isSamePair(requestedValue, value)
			if (isAlreadyNormalized) return
			setRequestedValue(value)
		}, [lowerValue, upperValue])

		// Two values under one name, like a multiple <select>:
		// FormData.getAll(name) gives [lower, upper].
		const buildFormValue = () => {
			const data = new FormData()
			const name = host.current.getAttribute('name') ?? ''
			data.append(name, String(lowerValue))
			data.append(name, String(upperValue))
			return data
		}

		const restoreFromForm = (state: unknown) => {
			const isFormData = state instanceof FormData
			if (!isFormData) return
			const name = host.current.getAttribute('name') ?? ''
			const restored = (state as FormData).getAll(name).map(Number)
			setRequestedValue([restored[0], restored[1]])
		}

		const formControl = useFormControl({
			value: buildFormValue(),
			isDisabled: props.isDisabled,
			control: lowerInputRef,
			onReset: () => setRequestedValue(defaultValue.current as RangeValueT),
			onRestore: restoreFromForm
		})
		const isDisabled = props.isDisabled || formControl.isFormDisabled

		const span = config.domainMax - config.domainMin || 1
		const toPct = (position: number) => ((position - config.domainMin) / span) * 100

		// Off-limits caps come ONLY from the outer bounds.
		const lowerCapWidth = toPct(config.lower.min)
		const upperCapWidth = 100 - toPct(config.upper.max)
		const lowerPct = toPct(lowerValue)
		const upperPct = toPct(upperValue)

		const hasHeader = Boolean(props.label) || props.doesShowValue

		// Returns the clamped value so the native input's live value can
		// be snapped at once; otherwise the browser keeps dragging the
		// thumb past its bound while only the state is clamped.
		const commit = (input: HTMLInputElement, which: 'lower' | 'upper', kind: 'input' | 'change') => {
			const raw = Number(input.value)
			const isLower = which === 'lower'
			const requested: RangeValueT = isLower ? [raw, upperValue] : [lowerValue, raw]
			const next = normalizeUnlessCrossing(requested, which, config)
			const moved = isLower ? next[0] : next[1]
			input.value = String(moved)
			setRequestedValue(next)
			const detail: RangeDetailT = { value: next }
			if (kind === 'input') props.input(detail)
			if (kind === 'change') props.change(detail)
		}

		return (
			<host
				shadowDom
				role="group"
				aria-label={props.label}
				style={{ '--left-accent': config.lower.tone, '--right-accent': config.upper.tone }}
			>
				{hasHeader && (
					<div class="header">
						{props.label && <span class="label">{props.label}</span>}
						{props.doesShowValue && (
							<span class="value">
								<span class="left">
									{props.valuePrefix}
									{lowerValue}
									{props.valueSuffix}
								</span>
								<span class="dash">–</span>
								<span class="right">
									{props.valuePrefix}
									{upperValue}
									{props.valueSuffix}
								</span>
							</span>
						)}
					</div>
				)}
				<div class="rail">
					<div class="track" />
					<div class="cap" style={{ left: '0', width: `${lowerCapWidth}%` }} />
					<div class="cap" style={{ right: '0', width: `${upperCapWidth}%` }} />
					<div class="fill" style={{ left: `${lowerPct}%`, right: `${100 - upperPct}%` }} />
					<input
						ref={lowerInputRef}
						class="left"
						type="range"
						min={config.domainMin}
						max={config.domainMax}
						step={config.lower.step}
						value={lowerValue}
						disabled={isDisabled}
						aria-label={config.lower.label}
						oninput={(inputEvent: any) => commit(inputEvent.target, 'lower', 'input')}
						onchange={(changeEvent: any) => commit(changeEvent.target, 'lower', 'change')}
					/>
					<input
						class="right"
						type="range"
						min={config.domainMin}
						max={config.domainMax}
						step={config.upper.step}
						value={upperValue}
						disabled={isDisabled}
						aria-label={config.upper.label}
						oninput={(inputEvent: any) => commit(inputEvent.target, 'upper', 'input')}
						onchange={(changeEvent: any) => commit(changeEvent.target, 'upper', 'change')}
					/>
				</div>
			</host>
		)
	},
	{
		props: {
			min: { type: Number, reflect: true },
			max: { type: Number, reflect: true },
			step: { type: Number, reflect: true },
			value: { type: Array },
			handles: { type: Array },
			name: { type: String, reflect: true },
			label: String,
			doesShowValue: { type: Boolean, reflect: true },
			valuePrefix: String,
			valueSuffix: String,
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			input: event<RangeDetailT>({ bubbles: true, composed: true }),
			change: event<RangeDetailT>({ bubbles: true, composed: true })
		},
		styles: [styles, interactionStyles],
		form: true
	}
)

defineFormElement('z-range', ZRange)
