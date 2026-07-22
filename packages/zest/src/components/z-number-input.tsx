import { c, css, event, useEffect, useHost, useProp, useState } from 'atomico'

/*
 * z-number-input — a typed numeric field with optional ghost stepper buttons.
 * `step`, `min`, and `max` are numbers (including decimals). Input validates
 * as the user types; blur normalizes invalid and out-of-range values.
 */
const styles = css`
	:host { display: inline-flex; width: fit-content; max-width: 100%; --accent: var(--primary); }
	:host([is-full-width]) { width: 100%; }
	:host([is-inline]) { width: auto; }
	:host([is-hidden]) { display: none; }
	:host([tone='primary']) { --accent: var(--purple); }
	:host([tone='secondary']) { --accent: var(--pink); }
	.field { display: inline-flex; align-items: stretch; width: 100%; box-sizing: border-box; min-width: 0; background: transparent; border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--foreground); font-family: inherit; overflow: hidden; transition: border-color 0.12s ease, background-color 0.12s ease; }
	.field.is-small { height: 2rem; font-size: var(--font-size-small); }
	.field.is-medium { height: 2.5rem; font-size: var(--font-size-body); }
	.field.is-large { height: 3rem; font-size: var(--font-size-h4); }
	.field:hover { border-color: color-mix(in oklch, var(--foreground) 30%, transparent); }
	.field.is-focused { border-color: var(--accent); background: color-mix(in oklch, var(--accent) 5%, transparent); }
	.field.is-invalid { border-color: var(--destructive); --accent: var(--destructive); }
	.field.is-disabled { opacity: 0.55; pointer-events: none; }
	input { flex: 1 1 auto; min-width: 0; width: 5ch; appearance: textfield; background: transparent; border: 0; outline: none; color: inherit; font: inherit; text-align: center; }
	input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { appearance: none; margin: 0; }
	.stepper { display: grid; place-items: center; flex: 0 0 auto; width: 2rem; border: 0; background: transparent; color: var(--muted-foreground); font: inherit; font-size: 1.125em; line-height: 1; cursor: pointer; transition: color 0.12s ease, background-color 0.12s ease; }
	.stepper:hover:not(:disabled) { color: var(--foreground); background: color-mix(in oklch, var(--foreground) 6%, transparent); }
	.stepper:active:not(:disabled) { background: color-mix(in oklch, var(--accent) 12%, transparent); color: var(--accent); }
	.stepper:focus-visible { position: relative; z-index: 1; outline: 2px solid color-mix(in oklch, var(--ring) 55%, transparent); outline-offset: -2px; }
	.stepper:disabled { cursor: not-allowed; opacity: 0.35; }
`

const resolveSizeClass = (props: any) => props.size === 'small' ? 'is-small' : props.size === 'large' ? 'is-large' : 'is-medium'
const isNumberText = (value: string) => /^-?(?:\d+|\d*\.\d+)$/.test(value)
const decimalPlaces = (value: number) => {
	const text = String(value).toLowerCase()
	const [coefficient, exponent] = text.split('e')
	const fractional = coefficient.split('.')[1]?.length || 0
	return Math.max(0, fractional - Number(exponent || 0))
}
const formatNumber = (value: number, step: number) => Number(value.toFixed(Math.min(12, decimalPlaces(step))))

export const ZNumberInput = c(
	(props) => {
		const host = useHost()
		const [value, setValue] = useProp<number>('value')
		const [rawValue, setRawValue] = useState(value == null ? '' : String(value))
		const [isFocused, setIsFocused] = useState(false)

		const requestedStep = Number(props.step)
		const requestedMin = Number(props.min)
		const requestedMax = Number(props.max)
		const step = Number.isFinite(requestedStep) && requestedStep > 0 ? requestedStep : 1
		const min = Number.isFinite(requestedMin) ? requestedMin : undefined
		const max = Number.isFinite(requestedMax) ? requestedMax : undefined
		const parsed = isNumberText(rawValue) ? Number(rawValue) : null
		const isInRange = parsed != null && (min == null || parsed >= min) && (max == null || parsed <= max)
		const isInvalid = Boolean(props.isInvalid) || (rawValue !== '' && !isInRange)

		useEffect(() => {
			if (!isFocused) setRawValue(value == null ? '' : String(value))
		}, [value, isFocused])

		const clamp = (next: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next))
		const commit = (next: number) => {
			const normalized = formatNumber(clamp(next), step)
			setValue(normalized)
			setRawValue(String(normalized))
			props.change({ value: normalized })
		}
		const stepValue = (direction: 1 | -1) => {
			if (props.isDisabled || props.isReadonly) return
			const base = parsed ?? value ?? min ?? 0
			commit(base + direction * step)
		}
		const correctOnBlur = () => {
			setIsFocused(false)
			if (parsed == null) {
				if (value != null) setRawValue(String(value))
				else if (min != null) commit(min)
				else setRawValue('')
				return
			}
			commit(parsed)
		}
		const fieldClass = ['field', resolveSizeClass(props)]
			.concat(isFocused ? ['is-focused'] : [])
			.concat(isInvalid ? ['is-invalid'] : [])
			.concat(props.isDisabled ? ['is-disabled'] : [])
			.join(' ')

		return <host shadowDom><div class={fieldClass}>
			{props.hasStepperButtons && <button class="stepper" type="button" disabled={props.isDisabled || props.isReadonly || (min != null && (parsed ?? value ?? min) <= min)} aria-label="Decrease value" onclick={() => stepValue(-1)}>−</button>}
			<input
				type="text"
				inputmode="decimal"
				value={rawValue}
				name={props.name}
				placeholder={props.placeholder}
				disabled={props.isDisabled}
				readonly={props.isReadonly}
				required={props.isRequired}
				aria-label={props.label || host.current?.getAttribute('aria-label') || undefined}
				aria-invalid={isInvalid ? 'true' : undefined}
				onfocus={(e: any) => { setIsFocused(true); e.target.select() }}
				onblur={correctOnBlur}
				onkeydown={(e: KeyboardEvent) => { if (e.key === 'ArrowUp') { e.preventDefault(); stepValue(1) } if (e.key === 'ArrowDown') { e.preventDefault(); stepValue(-1) } }}
				oninput={(e: any) => { const next = e.target.value; setRawValue(next); const numeric = isNumberText(next) ? Number(next) : null; if (numeric != null) setValue(numeric); const valid = numeric != null && (min == null || numeric >= min) && (max == null || numeric <= max); props.input({ value: numeric, rawValue: next, isValid: valid }) }}
			/>
			{props.hasStepperButtons && <button class="stepper" type="button" disabled={props.isDisabled || props.isReadonly || (max != null && (parsed ?? value ?? max) >= max)} aria-label="Increase value" onclick={() => stepValue(1)}>+</button>}
		</div></host>
	},
	{
		props: {
			value: { type: Number, reflect: true },
			min: { type: Number, reflect: true },
			max: { type: Number, reflect: true },
			step: { type: Number, reflect: true },
			label: String,
			name: String,
			placeholder: String,
			size: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			isInvalid: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isReadonly: { type: Boolean, reflect: true },
			isRequired: { type: Boolean, reflect: true },
			hasStepperButtons: { type: Boolean, reflect: true },
			isFullWidth: { type: Boolean, reflect: true },
			isInline: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			input: event<{ value: number | null; rawValue: string; isValid: boolean }>({ bubbles: true, composed: true }),
			change: event<{ value: number }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-number-input', ZNumberInput)
