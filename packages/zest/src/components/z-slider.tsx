import { c, css, event, useProp } from 'atomico'

/*
 * z-slider — a range control built on a native input[type=range] so keyboard
 * and a11y come for free, then fully restyled: hairline track, accent-filled
 * progress, and a solid accent thumb. The filled portion is driven by a
 * --fill custom property computed from the current value.
 */
const styles = css`
	:host {
		display: block;
		width: 100%;
		--accent: var(--primary);
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

		return (
			<host shadowDom style={{ '--fill': `${fill}%` }}>
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
