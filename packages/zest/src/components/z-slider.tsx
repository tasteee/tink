import { interactionStyles } from '../shared/interaction-styles'
import { defineFormElement, useFormControl } from '../shared/form-control'
import { useAccessibleName } from '../shared/accessible'
import { c, css, event, useProp, useRef } from 'atomico'
import { oneOf } from '../shared/prop-types'

/*
 * z-slider, a range control built on a native input[type=range] so keyboard
 * and a11y come for free, then fully restyled: hairline track, accent-filled
 * progress, and a solid accent thumb. The filled portion is driven by a
 * --fill custom property computed from the current value.
 *
 * An optional header sits above the track: a `label` on the left, and, when
 * `show-value` is set, the live value on the right as an accent-tinted pill
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
		margin-inline-start: auto;
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

	/* WebKit thumb. A fader cap: raised off the track, and lit in the accent
	   so it reads as the live part of the control. Both tokens are inert in
	   the flat themes. */
	input::-webkit-slider-thumb {
		appearance: none;
		width: 1rem;
		height: 1rem;
		margin-top: -6px;
		border-radius: 999px;
		--emissive-color: var(--accent);
		background: var(--material-raised), var(--accent);
		box-shadow: var(--elevation-raised), var(--emissive-tone);
		border: 2px solid var(--background);
		transition: transform var(--motion-instant) var(--ease-enter);
	}
	input::-webkit-slider-thumb:active {
		transform: scale(1.15);
	}

	/* Firefox thumb */
	input::-moz-range-thumb {
		width: 1rem;
		height: 1rem;
		border-radius: 999px;
		--emissive-color: var(--accent);
		background: var(--material-raised), var(--accent);
		box-shadow: var(--elevation-raised), var(--emissive-tone);
		border: 2px solid var(--background);
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

export const ZSlider = c(
	(props) => {
		const [value, setValue] = useProp<number>('value')
		const inputRef = useRef<HTMLInputElement>()
		const defaultValue = useRef(value)
		const accessibleName = useAccessibleName(props.label)

		const min = props.min ?? 0
		const max = props.max ?? 100
		const current = Math.min(max, Math.max(min, value ?? min))
		// A range always has a value, so it always submits one, as native does.
		const { isFormDisabled } = useFormControl({
			value: String(current),
			isDisabled: props.isDisabled,
			control: inputRef,
			onReset: () => setValue(defaultValue.current),
			onRestore: (state) => { if (typeof state === 'string' && state !== '') setValue(Number(state)) }
		})
		const isDisabled = props.isDisabled || isFormDisabled
		const fill = max > min ? ((current - min) / (max - min)) * 100 : 0

		const showHeader = Boolean(props.label) || props.doesShowValue

		return (
			<host shadowDom={{ delegatesFocus: true }} style={{ '--fill': `${fill}%` }}>
				{showHeader && (
					<div class="header">
						{props.label && <span class="label">{props.label}</span>}
						{props.doesShowValue && (
							<span class="value">
								{props.valuePrefix}
								{current}
								{props.valueSuffix}
							</span>
						)}
					</div>
				)}
				<input
					ref={inputRef}
					type="range"
					min={min}
					max={max}
					step={props.step ?? 1}
					value={current}
					disabled={isDisabled}
					aria-label={accessibleName}
					oninput={(e: any) => {
						e.stopPropagation()
						const next = Number(e.target.value)
						setValue(next)
						props.input({ value: next })
					}}
					onchange={(e: any) => {
						e.stopPropagation()
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
			name: { type: String, reflect: true },
			label: String,
			doesShowValue: { type: Boolean, reflect: true },
			valuePrefix: String,
			valueSuffix: String,
			tone: { type: oneOf('primary', 'secondary'), reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			input: event<{ value: number }>({ bubbles: true, composed: true }),
			change: event<{ value: number }>({ bubbles: true, composed: true })
		},
		styles: [styles, interactionStyles],
		form: true
	}
)

defineFormElement('z-slider', ZSlider)
