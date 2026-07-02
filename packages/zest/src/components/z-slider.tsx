import { c, css, event, useProp } from 'atomico'

/*
 * z-slider — a range control built on a native input[type=range] so keyboard
 * and a11y come for free, then fully restyled: hairline track, accent-filled
 * progress, and a solid accent thumb. The filled portion is driven by a
 * --fill custom property computed from the current value.
 *
 * An optional header sits above the track: a `label` on the left, and — when
 * `show-value` is set — the live value on the right as an accent-tinted pill
 * (with optional `value-prefix`/`value-suffix` for units like $ or %).
 */
const styles = css`
	:host {
		display: block;
		width: 100%;
		--accent: var(--primary);
	}

	/* Header row: label left, value pill right. */
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
		/* margin-left keeps the value flush-right even when there's no label. */
		margin-left: auto;
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-semibold);
		font-variant-numeric: tabular-nums;
		color: var(--accent);
		background: color-mix(in oklch, var(--accent) 12%, transparent);
		padding: 0.125rem 0.5rem;
		border-radius: 999px;
		line-height: 1.4;
		white-space: nowrap;
	}

	:host([tone='primary']) {
		--accent: var(--purple);
	}

	:host([tone='secondary']) {
		--accent: var(--pink);
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([is-disabled]) {
		opacity: 0.5;
		pointer-events: none;
	}

	input {
		appearance: none;
		width: 100%;
		height: 1rem;
		margin: 0;
		background: transparent;
		cursor: pointer;
	}

	/* WebKit track */
	input::-webkit-slider-runnable-track {
		height: 4px;
		border-radius: 999px;
		background: linear-gradient(
			to right,
			var(--accent) 0%,
			var(--accent) var(--fill, 0%),
			var(--border) var(--fill, 0%),
			var(--border) 100%
		);
	}

	/* Firefox track + progress */
	input::-moz-range-track {
		height: 4px;
		border-radius: 999px;
		background: var(--border);
	}
	input::-moz-range-progress {
		height: 4px;
		border-radius: 999px;
		background: var(--accent);
	}

	/* WebKit thumb */
	input::-webkit-slider-thumb {
		appearance: none;
		width: 1rem;
		height: 1rem;
		margin-top: -6px;
		border-radius: 999px;
		background: var(--accent);
		border: 2px solid var(--background);
		transition: transform 0.1s ease;
	}
	input::-webkit-slider-thumb:active {
		transform: scale(1.15);
	}

	/* Firefox thumb */
	input::-moz-range-thumb {
		width: 1rem;
		height: 1rem;
		border-radius: 999px;
		background: var(--accent);
		border: 2px solid var(--background);
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

export const ZSlider = c(
	(props) => {
		const [value, setValue] = useProp<number>('value')

		const min = props.min ?? 0
		const max = props.max ?? 100
		const current = value ?? min
		const fill = max > min ? ((current - min) / (max - min)) * 100 : 0

		const showHeader = Boolean(props.label) || props.showValue

		return (
			<host shadowDom style={{ '--fill': `${fill}%` }}>
				{showHeader && (
					<div class="header">
						{props.label && <span class="label">{props.label}</span>}
						{props.showValue && (
							<span class="value">
								{props.valuePrefix}
								{current}
								{props.valueSuffix}
							</span>
						)}
					</div>
				)}
				<input
					type="range"
					min={min}
					max={max}
					step={props.step ?? 1}
					value={current}
					name={props.name}
					disabled={props.isDisabled}
					aria-label={props.label}
					oninput={(e: any) => {
						const next = Number(e.target.value)
						setValue(next)
						props.input({ value: next })
					}}
					onchange={(e: any) => {
						props.change({ value: Number(e.target.value) })
					}}
				/>
			</host>
		)
	},
	{
		props: {
			value: { type: Number, reflect: true },
			min: { type: Number, reflect: true },
			max: { type: Number, reflect: true },
			step: { type: Number, reflect: true },
			name: String,
			label: String,
			showValue: { type: Boolean, reflect: true },
			valuePrefix: String,
			valueSuffix: String,
			tone: { type: String, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			input: event<{ value: number }>({ bubbles: true, composed: true }),
			change: event<{ value: number }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-slider', ZSlider)
