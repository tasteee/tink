import { interactionStyles } from '../shared/interaction-styles'
import { defineFormElement, useFormControl } from '../shared/form-control'
import { describableProps, useAccessibleName } from '../shared/accessible'
import { c, css, event, useEffect, useHost, useListener, useProp, useRef } from 'atomico'
import { oneOf } from '../shared/prop-types'
import { useLocale } from '../shared/locale'

/*
 * z-radio-group, coordinates single-selection across slotted z-radio items.
 * Listens for the bubbling `select` event, clears every other radio, and
 * re-emits a `change` with the chosen value. Mirrors z-toggle-button-group's model.
 *
 * `value` is the single source of truth in both directions. Set it and the
 * matching child is checked for you; leave it unset and the group adopts
 * whichever child was seeded with `is-checked`. Either way, reading `value`
 * afterwards tells the truth.
 *
 * The group, not the radios, is the form participant: it submits `value`
 * under its `name`, is what `is-required` validates, and forwards a form or
 * fieldset disabling to its children.
 */
const styles = css`
	:host {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		--z-radio-group-accent: var(--primary);
	}

	:host([tone='primary']) { --z-radio-group-accent: var(--purple); }
	:host([tone='secondary']) { --z-radio-group-accent: var(--pink); }
	:host([tone='success']) { --z-radio-group-accent: var(--success); }
	:host([tone='warning']) { --z-radio-group-accent: var(--warning); }
	:host([tone='danger']) { --z-radio-group-accent: var(--destructive); }

	:host([direction='horizontal']) {
		flex-direction: row;
		gap: var(--space-lg);
	}

	:host([is-hidden]) {
		display: none;
	}
`

type SelectDetailT = { value?: string }
type RadioElementT = HTMLElement & { isChecked?: boolean; isDisabled?: boolean; value?: string }

// A slotted child may not have upgraded yet when the group first reads it, so
// the attribute is the reliable fallback for its value.
const readRadioValue = (radio: RadioElementT): string | undefined => {
	if (radio.value != null) return radio.value
	return radio.getAttribute('value') ?? undefined
}

const readRadios = (host: HTMLElement): RadioElementT[] => {
	return [...host.querySelectorAll<RadioElementT>('z-radio')]
}

const findCheckedRadio = (radios: RadioElementT[]): RadioElementT | undefined => {
	return radios.find((radio) => radio.isChecked || radio.hasAttribute('is-checked'))
}

export const ZRadioGroup = c(
	(props) => {
		const t = useLocale()
		const host = useHost()
		const accessibleName = useAccessibleName(props.label)
		const [value, setValue] = useProp<string>('value')
		const defaultValue = useRef(value)
		const hasValue = value != null && value !== ''
		// The group has no native control of its own, so the browser's validation
		// bubble (and the focus that comes with it) is anchored to the checked
		// radio, or the first one that can be chosen.
		const radios = readRadios(host.current)
		const anchorRef = { current: findCheckedRadio(radios) ?? radios.find((radio) => !radio.isDisabled && !radio.hasAttribute('is-disabled')) }
		const { isFormDisabled } = useFormControl({
			value: hasValue ? value : null,
			isDisabled: props.isDisabled,
			control: anchorRef,
			validity: props.isRequired && !hasValue
				? { flags: { valueMissing: true }, message: t('selectOneOfTheseOptions') }
				: { flags: {} },
			onReset: () => setValue(defaultValue.current),
			onRestore: (state) => { if (typeof state === 'string') setValue(state) }
		})
		const isDisabled = Boolean(props.isDisabled) || isFormDisabled

		// Disabling the group disables its radios, but only the ones it disabled
		// get re-enabled, so an individually disabled radio stays that way.
		const disabledByGroup = useRef(new Set<RadioElementT>())
		const syncDisabled = () => {
			const radios = readRadios(host.current)
			if (isDisabled) {
				for (const radio of radios) {
					if (radio.isDisabled || radio.hasAttribute('is-disabled')) continue
					radio.isDisabled = true
					disabledByGroup.current.add(radio)
				}
				return
			}
			for (const radio of disabledByGroup.current) radio.isDisabled = false
			disabledByGroup.current.clear()
		}
		useEffect(syncDisabled, [isDisabled])

		useListener(
			host,
			'select',
			(rawEvent: unknown) => {
				const zEvent = rawEvent as CustomEvent<SelectDetailT>
				const target = zEvent.target as RadioElementT

				for (const item of readRadios(host.current)) {
					if (item !== target) item.isChecked = false
				}

				setValue(zEvent.detail.value)
				props.change({ value: zEvent.detail.value })
			},
			{ passive: true }
		)

		// Keep the children and `value` agreeing, whichever one was set first.
		// Assigning isChecked does not re-fire `select`, so this cannot loop.
		const syncSelection = () => {
			const radios = readRadios(host.current)
			const hasRadios = radios.length > 0
			if (!hasRadios) return

			const hasValue = value != null && value !== ''
			if (!hasValue) {
				const checkedRadio = findCheckedRadio(radios)
				if (checkedRadio) setValue(readRadioValue(checkedRadio))
				return
			}

			for (const radio of radios) {
				radio.isChecked = readRadioValue(radio) === value
			}
		}

		useEffect(syncSelection, [value])
		const onSlotChange = () => { syncSelection(); syncDisabled() }

		// Arrow keys move selection and focus through the enabled radios, wrapping
		// at the ends, as a native radio group does. The radios are separate
		// elements with no shared name, so the platform will not do this for us.
		const onKeyDown = (event: KeyboardEvent) => {
			const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1
				: event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1
				: 0
			if (!step || isDisabled) return
			const enabled = readRadios(host.current).filter((radio) => !radio.isDisabled && !radio.hasAttribute('is-disabled'))
			if (enabled.length === 0) return
			event.preventDefault()
			const focused = enabled.findIndex((radio) => radio === event.target || radio.contains(event.target as Node))
			const current = focused >= 0 ? focused : enabled.findIndex((radio) => radio.isChecked)
			const next = enabled[((current < 0 ? (step > 0 ? -1 : 0) : current) + step + enabled.length) % enabled.length]
			next.focus()
			const value = readRadioValue(next)
			if (value === undefined || value === props.value) return
			for (const radio of readRadios(host.current)) radio.isChecked = radio === next
			setValue(value)
			props.change({ value })
		}

		// The radios are light-DOM children, which delegatesFocus does not reach,
		// so the host takes focus itself (programmatic or from reportValidity)
		// and passes it straight on to the checked or first usable radio.
		const forwardFocus = (event: FocusEvent) => {
			if (event.target !== host.current) return
			anchorRef.current?.focus()
		}

		return (
			<host
				shadowDom
				role="radiogroup"
				tabindex="-1"
				onfocus={forwardFocus}
				onkeydown={onKeyDown}
				aria-label={accessibleName}
				aria-description={[props.description, props.error].filter(Boolean).join(' ') || undefined}
				aria-invalid={props.error ? 'true' : undefined}
				aria-required={props.isRequired ? 'true' : undefined}
			>
				<slot onslotchange={onSlotChange} />
			</host>
		)
	},
	{
		props: {
			...describableProps,
			value: { type: String, reflect: true },
			name: { type: String, reflect: true },
			label: String,
			direction: { type: oneOf('vertical', 'horizontal'), reflect: true },
			tone: { type: oneOf('neutral', 'primary', 'secondary', 'success', 'warning', 'danger'), reflect: true },
			isRequired: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ value?: string }>({ bubbles: true, composed: true })
		},
		styles: [styles, interactionStyles],
		form: true
	}
)

defineFormElement('z-radio-group', ZRadioGroup)
