import { useEffect, useFormDisabled, useFormReset, useHost, useState } from 'atomico'
import type { Ref } from 'atomico'
import { defineElement } from './define-element'
import { useLocale } from './locale'

/*
 * Form participation for Zest controls.
 *
 * A control inside a shadow root is invisible to the surrounding <form>: its
 * inner <input> has no form owner, so nothing is submitted, `required` never
 * blocks a submit, and reset() does nothing. The platform answer is
 * form-associated custom elements: the *host* becomes the form participant
 * through ElementInternals, and it is the host's `name` attribute that names
 * the FormData entry.
 *
 * `useFormControl` is that bridge, shared by every control. It
 *   - publishes the value to the form on every render,
 *   - mirrors the inner control's ValidityState (or flags the component
 *     computes itself) onto the host, anchored so the browser's validation
 *     bubble points at the real input,
 *   - honours reset, fieldset/form disabling and state restore,
 *   - treats a disabled or readonly control the way the platform does: no
 *     entry, no validation.
 *
 * `defineFormElement` installs the native constraint-validation surface on
 * the host (`form`, `validity`, `validationMessage`, `willValidate`, `labels`,
 * `checkValidity()`, `reportValidity()`, `setCustomValidity()`), so a Zest
 * control can stand wherever an <input> could.
 *
 * Where ElementInternals is unavailable (older Safari, happy-dom) everything
 * degrades to a no-op rather than throwing: the control still renders and
 * still fires its own events, it just does not take part in the form.
 */

const INTERNALS = Symbol.for('zest/form-control/internals')
const CUSTOM_MESSAGE = Symbol.for('zest/form-control/custom-message')
const RESTORE = Symbol.for('zest/form-control/restore')

const NATIVE_FLAGS = [
	'valueMissing', 'typeMismatch', 'patternMismatch', 'tooLong', 'tooShort',
	'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'badInput'
] as const

export type ValidityFlagsT = Partial<Record<(typeof NATIVE_FLAGS)[number] | 'customError', boolean>>
export type FormValueT = string | File | FormData | null
export type FormRestoreModeT = 'restore' | 'autocomplete'

type FormHostT = HTMLElement & {
	[INTERNALS]?: ElementInternals | null
	[CUSTOM_MESSAGE]?: string
	[RESTORE]?: (state: FormValueT, mode: FormRestoreModeT) => void
	update?: () => Promise<void>
}

export type FormControlConfigT = {
	/** The entry submitted under the host's `name`. `null` submits nothing (an unchecked checkbox). */
	value: FormValueT
	/** True when the component's own `is-disabled` prop is set. */
	isDisabled?: boolean
	/** True when the component's own `is-readonly` prop is set. Readonly controls are not validated, as in the platform. */
	isReadonly?: boolean
	/** The native control inside the shadow root. Its ValidityState is mirrored and it anchors the validation bubble. */
	control?: Ref<HTMLElement | undefined>
	/** Validity the component works out itself, merged over the mirrored native flags. */
	validity?: { flags: ValidityFlagsT; message?: string }
	/** Pressing Enter in a single-line control submits the owning form, as it would in a native input. */
	submitsOnEnter?: boolean
	/** Called by form.reset(): put the control back to its default. */
	onReset: () => void
	/** Called by the browser restoring state after navigation or autofill. */
	onRestore?: (state: FormValueT, mode: FormRestoreModeT) => void
}

export type FormControlT = {
	internals: ElementInternals | null
	/** True while an ancestor <fieldset disabled> or the form itself disables this control. Combine with the component's own prop. */
	isFormDisabled: boolean
	/** Submits the owning form the way a native control's Enter key would, running validation first. */
	requestSubmit: () => void
}

const attachInternals = (host: FormHostT): ElementInternals | null => {
	if (host[INTERNALS] !== undefined) return host[INTERNALS]
	const canAttach = typeof host.attachInternals === 'function'
	host[INTERNALS] = canAttach ? host.attachInternals() : null
	return host[INTERNALS]
}

const readNativeValidity = (control: HTMLElement | undefined): { flags: ValidityFlagsT; message: string } => {
	const flags: ValidityFlagsT = {}
	const native = control as (HTMLElement & { validity?: ValidityState; validationMessage?: string }) | undefined
	if (!native?.validity) return { flags, message: '' }
	for (const flag of NATIVE_FLAGS) if (native.validity[flag]) flags[flag] = true
	return { flags, message: native.validationMessage ?? '' }
}

const hasFailure = (flags: ValidityFlagsT): boolean => Object.values(flags).some(Boolean)

export const useFormControl = (config: FormControlConfigT): FormControlT => {
	const host = useHost() as unknown as { current: FormHostT }
	const [isFormDisabled, setIsFormDisabled] = useState(false)
	const internals = attachInternals(host.current)
	const t = useLocale()

	useFormDisabled((disabled) => setIsFormDisabled(disabled))
	useFormReset(() => config.onReset())

	// The restore callback lives on the prototype (see defineFormElement); the
	// hook only supplies the per-instance handler.
	host.current[RESTORE] = config.onRestore

	useEffect(() => {
		if (!internals) return
		const inert = config.isDisabled || isFormDisabled || config.isReadonly
		if (config.isDisabled || isFormDisabled) internals.setFormValue(null)
		else internals.setFormValue(config.value, config.value)

		if (inert) {
			internals.setValidity({})
			return
		}

		const native = readNativeValidity(config.control?.current)
		const custom = host.current[CUSTOM_MESSAGE]
		const flags: ValidityFlagsT = { ...native.flags, ...config.validity?.flags }
		if (custom) flags.customError = true
		const message = custom || config.validity?.message || native.message || (hasFailure(flags) ? t('invalidValue') : '')
		const anchor = config.control?.current
		if (hasFailure(flags)) internals.setValidity(flags, message, anchor)
		else internals.setValidity({})
	})

	const requestSubmit = () => {
		const form = internals?.form
		if (!form) return
		form.requestSubmit()
	}

	useEffect(() => {
		if (!config.submitsOnEnter) return
		const control = config.control?.current
		if (!control) return
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Enter' || event.isComposing || event.defaultPrevented) return
			if (config.isDisabled || isFormDisabled || config.isReadonly) return
			event.preventDefault()
			requestSubmit()
		}
		control.addEventListener('keydown', onKeyDown)
		return () => control.removeEventListener('keydown', onKeyDown)
	}, [config.control?.current, config.submitsOnEnter, config.isDisabled, isFormDisabled, config.isReadonly])

	return { internals, isFormDisabled, requestSubmit }
}

const emptyValidity = (): ValidityState => {
	const state = { valid: true } as Record<string, boolean>
	for (const flag of NATIVE_FLAGS) state[flag] = false
	state.customError = false
	return state as unknown as ValidityState
}

const emptyLabels = (): NodeList => document.createDocumentFragment().childNodes

/**
 * Registers a form-associated element and gives its prototype the same
 * constraint-validation surface a native control has. The component must
 * pass `form: true` to `c()` and call `useFormControl` in its view.
 */
export const defineFormElement = (name: string, constructor: CustomElementConstructor): void => {
	const prototype = constructor.prototype as FormHostT
	const internalsOf = (host: FormHostT) => attachInternals(host)
	const alreadyInstalled = Object.getOwnPropertyDescriptor(prototype, 'checkValidity')
	if (!alreadyInstalled) {
		Object.defineProperties(prototype, {
			form: { get(this: FormHostT) { return internalsOf(this)?.form ?? null }, configurable: true },
			validity: { get(this: FormHostT) { return internalsOf(this)?.validity ?? emptyValidity() }, configurable: true },
			validationMessage: { get(this: FormHostT) { return internalsOf(this)?.validationMessage ?? '' }, configurable: true },
			willValidate: { get(this: FormHostT) { return internalsOf(this)?.willValidate ?? false }, configurable: true },
			labels: { get(this: FormHostT) { return internalsOf(this)?.labels ?? emptyLabels() }, configurable: true },
			checkValidity: { value(this: FormHostT) { return internalsOf(this)?.checkValidity() ?? true }, configurable: true },
			reportValidity: { value(this: FormHostT) { return internalsOf(this)?.reportValidity() ?? true }, configurable: true },
			setCustomValidity: {
				value(this: FormHostT, message: string) {
					this[CUSTOM_MESSAGE] = message ? String(message) : ''
					// The next render re-runs the validity sync with the new message.
					void this.update?.()
				},
				configurable: true
			},
			formStateRestoreCallback: {
				value(this: FormHostT, state: FormValueT, mode: FormRestoreModeT) { this[RESTORE]?.(state, mode) },
				configurable: true
			}
		})
	}
	defineElement(name, constructor)
}

/** The public surface `defineFormElement` adds to a control's instances. */
export type FormControlHostT = {
	readonly form: HTMLFormElement | null
	readonly validity: ValidityState
	readonly validationMessage: string
	readonly willValidate: boolean
	readonly labels: NodeList
	checkValidity(): boolean
	reportValidity(): boolean
	setCustomValidity(message: string): void
}
