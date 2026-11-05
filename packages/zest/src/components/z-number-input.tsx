import { interactionStyles } from '../shared/interaction-styles'
import { defineFormElement, useFormControl } from '../shared/form-control'
import { describableProps, describedBy, renderDescriptions, srOnlyStyles, useAccessibleName } from '../shared/accessible'
import type { ValidityFlagsT } from '../shared/form-control'
import { c, css, event, useEffect, useHost, useProp, useRef, useState } from 'atomico'
import { oneOf } from '../shared/prop-types'
import { useLocale } from '../shared/locale'

/*
 * z-number-input, a typed numeric field with optional ghost stepper buttons.
 * `step`, `min`, and `max` are numbers (including decimals). Input validates
 * as the user types; blur normalizes invalid and out-of-range values.
 *
 * Form-associated. The inner control is a text input (so the platform's
 * number spinner never fights the ghost steppers), which means range and step
 * validity are worked out here and handed to the form, the way a native
 * number input would report them.
 */
const styles = css`
	.field:focus-within { outline: 2px solid var(--focus-ring); outline-offset: 2px; }

	:host { display: inline-flex; width: fit-content; max-width: 100%; --accent: var(--primary); }
	:host([is-full-width]) { width: 100%; }
	:host([is-inline]) { width: auto; }
	:host([is-hidden]) { display: none; }
	:host([tone='primary']) { --accent: var(--purple); }
	:host([tone='secondary']) { --accent: var(--pink); }
	.field { display: inline-flex; align-items: stretch; width: 100%; box-sizing: border-box; min-width: 0; background: transparent; border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--foreground); font-family: inherit; overflow: hidden; transition: border-color var(--motion-fast) var(--ease-enter), background-color var(--motion-fast) var(--ease-enter); }
	.field.is-sm { height: var(--control-height-sm); font-size: var(--control-font-size-sm); }
	.field.is-md { height: var(--control-height-md); font-size: var(--control-font-size-md); }
	.field.is-lg { height: var(--control-height-lg); font-size: var(--control-font-size-lg); }
	.field:hover { border-color: color-mix(in oklch, var(--foreground) 30%, transparent); }
	.field.is-focused { border-color: var(--accent); background: color-mix(in oklch, var(--accent) 5%, transparent); }
	.field.is-invalid { border-color: var(--destructive); --accent: var(--destructive); }
	.field.is-disabled { opacity: var(--control-disabled-opacity); pointer-events: none; }
	input { flex: 1 1 auto; min-width: 0; width: 5ch; appearance: textfield; background: transparent; border: 0; outline: none; color: inherit; font: inherit; text-align: center; }
	input::placeholder { color: var(--muted-foreground); user-select: none; -webkit-user-select: none; }
	input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { appearance: none; margin: 0; }
	.stepper { display: grid; place-items: center; flex: 0 0 auto; width: 2rem; border: 0; background: transparent; color: var(--muted-foreground); font: inherit; font-size: 1.125em; line-height: 1; cursor: pointer; user-select: none; -webkit-user-select: none; transition: color var(--motion-fast) var(--ease-enter), background-color var(--motion-fast) var(--ease-enter); }
	.stepper:hover:not(:disabled) { color: var(--foreground); background: color-mix(in oklch, var(--foreground) 6%, transparent); }
	.stepper:active:not(:disabled) { background: color-mix(in oklch, var(--accent) 12%, transparent); color: var(--accent); }
	.stepper:focus-visible { position: relative; z-index: 1; outline: 2px solid var(--focus-ring); outline-offset: -2px; }
	.stepper:disabled { cursor: not-allowed; opacity: 0.35; }
`

const resolveSizeClass = (props: any) => props.size === 'sm' ? 'is-sm' : props.size === 'lg' ? 'is-lg' : 'is-md'
const isNumberText = (value: string) => /^-?(?:\d+|\d*\.\d+)$/.test(value)
const decimalPlaces = (value: number) => {
	const text = String(value).toLowerCase()
	const [coefficient, exponent] = text.split('e')
	const fractional = coefficient.split('.')[1]?.length || 0
	return Math.max(0, fractional - Number(exponent || 0))
}

export const ZNumberInput = c(
	(props) => {
		const t = useLocale()
		const host = useHost()
		const accessibleName = useAccessibleName(props.label)
		const inputRef = useRef<HTMLInputElement>()
		const [value, setValue] = useProp<number>('value')
		const defaultValue = useRef(value)
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

		const formValidity = (): { flags: ValidityFlagsT; message?: string } => {
			if (rawValue === '') return { flags: {} }
			if (parsed == null) return { flags: { badInput: true }, message: t('enterANumber') }
			if (min != null && parsed < min) return { flags: { rangeUnderflow: true }, message: t('valueAtLeast', { min }) }
			if (max != null && parsed > max) return { flags: { rangeOverflow: true }, message: t('valueAtMost', { max }) }
			const offset = (parsed - (min ?? 0)) / step
			const precision = Math.max(decimalPlaces(step), decimalPlaces(parsed), decimalPlaces(min ?? 0))
			const isOnStep = Math.abs(offset - Math.round(offset)) < 10 ** -Math.min(12, precision + 2)
			if (!isOnStep) return { flags: { stepMismatch: true }, message: t('valueOnStep', { low: Number((Math.floor(offset) * step + (min ?? 0)).toFixed(precision)), high: Number((Math.ceil(offset) * step + (min ?? 0)).toFixed(precision)) }) }
			return { flags: {} }
		}
		const { isFormDisabled } = useFormControl({
			value: parsed != null ? String(parsed) : '',
			isDisabled: props.isDisabled,
			isReadonly: props.isReadonly,
			control: inputRef,
			validity: formValidity(),
			submitsOnEnter: true,
			onReset: () => { setValue(defaultValue.current); setRawValue(defaultValue.current == null ? '' : String(defaultValue.current)) },
			onRestore: (state) => {
				if (typeof state !== 'string') return
				setRawValue(state)
				if (isNumberText(state)) setValue(Number(state))
			}
		})
		const isDisabled = props.isDisabled || isFormDisabled

		useEffect(() => {
			if (!isFocused) setRawValue(value == null ? '' : String(value))
		}, [value, isFocused])

		const clamp = (next: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next))
		const commit = (next: number) => {
			// Preserve authored precision and clamp after rounding so a fractional
			// boundary can never be rounded back out of range.
			const precision = Math.max(decimalPlaces(step), decimalPlaces(next))
			const normalized = clamp(Number(next.toFixed(Math.min(12, precision))))
			setValue(normalized)
			setRawValue(String(normalized))
			props.change({ value: normalized })
		}
		const stepValue = (direction: 1 | -1) => {
			if (isDisabled || props.isReadonly) return
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
			.concat(isDisabled ? ['is-disabled'] : [])
			.join(' ')

		return <host shadowDom={{ delegatesFocus: true }}><div class={fieldClass}>
			{props.hasStepperButtons && <button class="stepper" type="button" tabindex="-1" disabled={isDisabled || props.isReadonly || (min != null && (parsed ?? value ?? min) <= min)} aria-label={t('decreaseValue')} onclick={() => stepValue(-1)}>−</button>}
			<input
				ref={inputRef}
				type="text"
				role="spinbutton"
				aria-valuemin={min}
				aria-valuemax={max}
				aria-valuenow={parsed != null && Number.isFinite(parsed) ? parsed : undefined}
				inputmode="decimal"
				value={rawValue}
				placeholder={props.placeholder}
				disabled={isDisabled}
				readonly={props.isReadonly}
				required={props.isRequired}
				aria-label={accessibleName}
				aria-describedby={describedBy(props.description, props.error)}
				aria-invalid={isInvalid || props.error ? 'true' : undefined}
				onfocus={(e: any) => { setIsFocused(true); e.target.select() }}
				onblur={correctOnBlur}
				onkeydown={(e: KeyboardEvent) => { if (e.key === 'ArrowUp') { e.preventDefault(); stepValue(1) } if (e.key === 'ArrowDown') { e.preventDefault(); stepValue(-1) } }}
				oninput={(e: any) => { e.stopPropagation(); const next = e.target.value; setRawValue(next); const numeric = isNumberText(next) ? Number(next) : null; if (numeric != null) setValue(numeric); const valid = numeric != null && (min == null || numeric >= min) && (max == null || numeric <= max); props.input({ value: numeric, rawValue: next, isValid: valid }) }}
			/>
			{props.hasStepperButtons && <button class="stepper" type="button" tabindex="-1" disabled={isDisabled || props.isReadonly || (max != null && (parsed ?? value ?? max) >= max)} aria-label={t('increaseValue')} onclick={() => stepValue(1)}>+</button>}
		</div>{renderDescriptions(props.description, props.error)}</host>
	},
	{
		props: {
			...describableProps,
			value: { type: Number, reflect: true },
			min: { type: Number, reflect: true },
			max: { type: Number, reflect: true },
			step: { type: Number, reflect: true },
			label: String,
			name: { type: String, reflect: true },
			placeholder: String,
			size: { type: oneOf('sm', 'md', 'lg'), reflect: true },
			tone: { type: oneOf('primary', 'secondary'), reflect: true },
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
		styles: [styles, interactionStyles, srOnlyStyles],
		form: true
	}
)

defineFormElement('z-number-input', ZNumberInput)
