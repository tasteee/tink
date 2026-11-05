import { interactionStyles } from '../shared/interaction-styles'
import { defineFormElement, useFormControl } from '../shared/form-control'
import { describableProps, describedBy, renderDescriptions, srOnlyStyles, useAccessibleName } from '../shared/accessible'
import { c, css, event, useHost, useProp, useRef } from 'atomico'
import { oneOf } from '../shared/prop-types'

/*
 * z-input, single-line text field. Transparent fill, hairline border that
 * lifts to the accent on focus (theme primary by default, with explicit
 * `dom` and `sub` accents). Optional
 * leading/trailing slots for icons or adornments. No shadows.
 *
 * Form-associated: the host carries `name`, submits `value`, mirrors the
 * inner input's validity, resets to its initial value, and Enter submits the
 * owning form. See ../shared/form-control.ts.
 */
const styles = css`
	.field:focus-within { outline: 2px solid var(--focus-ring); outline-offset: 2px; }

	:host {
		display: inline-flex;
		width: 100%;
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([is-inline]) {
		width: auto;
	}

	.field {
		display: inline-flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		box-sizing: border-box;
		/* A field is a hole cut into the surface, so it takes the carved stack
		   rather than a raised one. Both are inert in the flat themes. */
		background: var(--material-surface);
		box-shadow: var(--elevation-carved);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--foreground);
		font-family: inherit;
		/* a <label> wrapper: clicking the padding or empty adornments focuses the
		   input natively, so there are no dead zones on the sides. */
		cursor: text;
		transition:
			border-color var(--motion-fast) var(--ease-enter),
			background-color var(--motion-fast) var(--ease-enter);
		--accent: var(--primary);
	}

	:host([tone='primary']) .field {
		--accent: var(--purple);
	}

	:host([tone='secondary']) .field {
		--accent: var(--pink);
	}

	/* sizes */
	.field.is-sm {
		height: var(--control-height-sm);
		padding-inline: 0.625rem;
		font-size: var(--control-font-size-sm);
	}
	.field.is-md {
		height: var(--control-height-md);
		padding-inline: 0.75rem;
		font-size: var(--control-font-size-md);
	}
	.field.is-lg {
		height: var(--control-height-lg);
		padding-inline: 0.875rem;
		font-size: var(--control-font-size-lg);
	}

	.field:hover {
		border-color: color-mix(in oklch, var(--foreground) 30%, transparent);
	}

	.field.is-focused {
		border-color: var(--accent);
		background: color-mix(in oklch, var(--accent) 5%, transparent);
	}

	.field.is-invalid {
		border-color: var(--destructive);
		--accent: var(--destructive);
	}

	.field.is-disabled {
		opacity: var(--control-disabled-opacity);
		pointer-events: none;
	}

	input {
		flex: 1 1 auto;
		min-width: 0;
		height: 100%;
		appearance: none;
		background: transparent;
		border: none;
		outline: none;
		color: inherit;
		font-family: inherit;
		font-size: inherit;
		line-height: 1;
		padding: 0;
	}

	input::placeholder {
		color: var(--muted-foreground);
		user-select: none;
		-webkit-user-select: none;
	}

	/* kill the ugly native number spinners / search clear */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		appearance: none;
		margin: 0;
	}
	input[type='search']::-webkit-search-cancel-button {
		appearance: none;
	}

	.adornment {
		display: inline-flex;
		align-items: center;
		color: var(--muted-foreground);
		flex-shrink: 0;
	}

	.field.is-focused .adornment {
		color: var(--accent);
	}

	::slotted(svg) {
		width: 1.125em;
		height: 1.125em;
	}
`

const resolveSizeClass = (props: any): string => {
	if (props.size === 'sm') return 'is-sm'
	if (props.size === 'lg') return 'is-lg'
	return 'is-md'
}

export const ZInput = c(
	(props) => {
		const host = useHost()
		const accessibleName = useAccessibleName(props.label)
		const inputRef = useRef<HTMLInputElement>()
		const [value, setValue] = useProp<string>('value')
		const defaultValue = useRef(value ?? '')
		const committedValue = useRef(value ?? '')
		const [isFocused, setIsFocused] = useProp<boolean>('isFocused')
		const { isFormDisabled } = useFormControl({
			value: value ?? '',
			isDisabled: props.isDisabled,
			isReadonly: props.isReadonly,
			control: inputRef,
			submitsOnEnter: true,
			onReset: () => setValue(defaultValue.current),
			onRestore: (state) => { if (typeof state === 'string') setValue(state) }
		})
		const isDisabled = props.isDisabled || isFormDisabled

		const fieldClass = ['field', resolveSizeClass(props)]
			.concat(isFocused ? ['is-focused'] : [])
			.concat(props.isInvalid ? ['is-invalid'] : [])
			.concat(isDisabled ? ['is-disabled'] : [])
			.join(' ')

		return (
			<host shadowDom={{ delegatesFocus: true }}>
				<label class={fieldClass}>
					<span class="adornment">
						<slot name="prefix" />
					</span>
					<input
						ref={inputRef}
						type={props.type || 'text'}
						value={value ?? ''}
						placeholder={props.placeholder}
						disabled={isDisabled}
						readonly={props.isReadonly}
						required={props.isRequired}
						autocomplete={props.autocomplete as any}
						inputmode={props.inputmode}
						aria-label={accessibleName}
						aria-describedby={describedBy(props.description, props.error)}
						aria-invalid={props.isInvalid || props.error ? 'true' : undefined}
						onfocus={() => { committedValue.current = value ?? ''; setIsFocused(true) }}
						onblur={(e: Event) => {
							setIsFocused(false)
							// Read the control, not the render closure: a keystroke and a blur
							// in the same task would otherwise compare against a stale value.
							const next = (e.target as HTMLInputElement).value
							if (next !== committedValue.current) { committedValue.current = next; props.change({ value: next }) }
						}}
						onchange={(e: Event) => e.stopPropagation()}
						oninput={(e: any) => {
							e.stopPropagation()
							const next = e.target.value
							setValue(next)
							props.input({ value: next })
						}}
					/>
					<span class="adornment">
						<slot name="suffix" />
					</span>
				</label>
				{renderDescriptions(props.description, props.error)}
			</host>
		)
	},
	{
		props: {
			...describableProps,
			value: { type: String, reflect: true },
			label: String,
			type: { type: oneOf('text', 'email', 'password', 'number', 'search', 'tel', 'url') },
			placeholder: String,
			name: { type: String, reflect: true },
			autocomplete: String,
			inputmode: String,
			size: { type: oneOf('sm', 'md', 'lg'), reflect: true },
			tone: { type: oneOf('primary', 'secondary'), reflect: true },
			isFocused: { type: Boolean, reflect: true },
			isInvalid: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isReadonly: { type: Boolean, reflect: true },
			isRequired: { type: Boolean, reflect: true },
			isInline: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			input: event<{ value: string }>({ bubbles: true, composed: true }),
			change: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles: [styles, interactionStyles, srOnlyStyles],
		form: true
	}
)

defineFormElement('z-input', ZInput)
