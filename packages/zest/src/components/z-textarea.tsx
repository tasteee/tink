import { c, css, event, useHost, useProp } from 'atomico'
import { themedScrollbarStyles } from '../shared/scrollbar-styles'

/*
 * z-textarea — multi-line text field. Same hairline-to-accent focus treatment
 * as z-input. Supports auto-grow (is-auto-resize) so the field tracks content
 * height without a scrollbar.
 */
const styles = css`
	:host {
		display: block;
		width: 100%;
	}

	:host([is-hidden]) {
		display: none;
	}

	.field {
		display: block;
		width: 100%;
		box-sizing: border-box;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--foreground);
		font-family: inherit;
		font-size: var(--font-size-body);
		line-height: 1.6;
		padding: 0.75rem 0.875rem;
		transition: border-color 0.12s ease, background-color 0.12s ease;
		--accent: var(--primary);
	}

	:host([tone='primary']) .field {
		--accent: var(--purple);
	}

	:host([tone='secondary']) .field {
		--accent: var(--pink);
	}

	textarea {
		display: block;
		width: 100%;
		box-sizing: border-box;
		resize: vertical;
		appearance: none;
		background: transparent;
		border: none;
		outline: none;
		color: inherit;
		font-family: inherit;
		font-size: inherit;
		line-height: inherit;
		padding: 0;
		min-height: calc(1.6em * 3);
	}

	textarea.is-auto-resize {
		resize: none;
		overflow: hidden;
	}

	textarea::placeholder {
		color: var(--muted-foreground);
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
`

const autoGrow = (el: HTMLTextAreaElement) => {
	el.style.height = 'auto'
	el.style.height = `${el.scrollHeight}px`
}

export const ZTextarea = c(
	(props) => {
		const host = useHost()
		const [value, setValue] = useProp<string>('value')
		const [isFocused, setIsFocused] = useProp<boolean>('isFocused')

		const fieldClass = ['field']
			.concat(isFocused ? ['is-focused'] : [])
			.concat(props.isInvalid ? ['is-invalid'] : [])
			.concat(props.isDisabled ? ['is-disabled'] : [])
			.join(' ')

		const textareaClass = props.isAutoResize ? 'is-auto-resize' : ''

		return (
			<host shadowDom>
				<div class={fieldClass}>
					<textarea
						class={textareaClass}
						value={value ?? ''}
						placeholder={props.placeholder}
						name={props.name}
						rows={props.rows || 3}
						disabled={props.isDisabled}
						readonly={props.isReadonly}
						required={props.isRequired}
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
							if (props.isAutoResize) autoGrow(e.target)
							props.input({ value: next })
						}}
					/>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true },
			label: String,
			placeholder: String,
			name: String,
			rows: Number,
			size: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			isFocused: { type: Boolean, reflect: true },
			isInvalid: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isReadonly: { type: Boolean, reflect: true },
			isRequired: { type: Boolean, reflect: true },
			isAutoResize: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			input: event<{ value: string }>({ bubbles: true, composed: true }),
			change: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles: [themedScrollbarStyles, styles]
	}
)

customElements.define('z-textarea', ZTextarea)
