import { c, css, event, useHost, useProp } from 'atomico'

/*
 * z-input — single-line text field. Transparent fill, hairline border that
 * lifts to the accent on focus (purple by default, pink via tone). Optional
 * leading/trailing slots for icons or adornments. No shadows.
 */
const styles = css`
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
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--foreground);
		font-family: inherit;
		/* a <label> wrapper: clicking the padding or empty adornments focuses the
		   input natively, so there are no dead zones on the sides. */
		cursor: text;
		transition:
			border-color 0.12s ease,
			background-color 0.12s ease;
		--accent: var(--primary);
	}

	:host([tone='primary']) .field {
		--accent: var(--purple);
	}

	:host([tone='secondary']) .field {
		--accent: var(--pink);
	}

	/* sizes */
	.field.is-small {
		height: 2.25rem;
		padding-inline: 0.75rem;
		font-size: var(--font-size-small);
	}
	.field.is-medium {
		height: 2.75rem;
		padding-inline: 0.875rem;
		font-size: var(--font-size-body);
	}
	.field.is-large {
		height: 3.25rem;
		padding-inline: 1rem;
		font-size: var(--font-size-h4);
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
		opacity: 0.55;
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
	if (props.size === 'small') return 'is-small'
	if (props.size === 'large') return 'is-large'
	return 'is-medium'
}

export const ZInput = c(
	(props) => {
		const host = useHost()
		const [value, setValue] = useProp<string>('value')
		const [isFocused, setIsFocused] = useProp<boolean>('isFocused')

		const fieldClass = ['field', resolveSizeClass(props)]
			.concat(isFocused ? ['is-focused'] : [])
			.concat(props.isInvalid ? ['is-invalid'] : [])
			.concat(props.isDisabled ? ['is-disabled'] : [])
			.join(' ')

		return (
			<host shadowDom>
				<label class={fieldClass}>
					<span class='adornment'>
						<slot name='prefix' />
					</span>
					<input
						type={props.type || 'text'}
						value={value ?? ''}
						placeholder={props.placeholder}
						name={props.name}
						disabled={props.isDisabled}
						readonly={props.isReadonly}
						required={props.isRequired}
						autocomplete={props.autocomplete as any}
						inputmode={props.inputmode}
						aria-invalid={props.isInvalid ? 'true' : undefined}
						aria-label={props.label || host.current?.getAttribute('aria-label') || undefined}
						onfocus={() => setIsFocused(true)}
						onblur={() => {
							setIsFocused(false)
							props.change({ value: value ?? '' })
						}}
						oninput={(e: any) => {
							const next = e.target.value
							setValue(next)
							props.input({ value: next })
						}}
					/>
					<span class='adornment'>
						<slot name='suffix' />
					</span>
				</label>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true },
			label: String,
			type: String,
			placeholder: String,
			name: String,
			autocomplete: String,
			inputmode: String,
			size: { type: String, reflect: true },
			tone: { type: String, reflect: true },
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
		styles
	}
)

customElements.define('z-input', ZInput)
