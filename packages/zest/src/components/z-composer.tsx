import { c, css, event, useProp, useRef } from 'atomico'

/*
 * z-composer — the message input row: an auto-growing textarea flanked by a
 * leading action slot (attach / emoji) and a trailing send control. Enter sends,
 * Shift+Enter inserts a newline (flip with `disable-enter-submit`).
 *
 *   <z-composer placeholder="Message…">
 *     <z-button slot="leading" kind="ghost">＋</z-button>
 *   </z-composer>
 *
 * Emits `input` {value} as you type and `send` {value} on submit (then clears).
 * The default trailing send button is disabled while empty; drop your own into
 * the `trailing` slot to replace it. This is the shared base the AI
 * `z-prompt-input` extends (stop-streaming, model picker, token counter).
 */
const styles = css`
	:host {
		display: block;
	}
	:host([is-hidden]) {
		display: none;
	}
	.composer {
		display: flex;
		align-items: flex-end;
		gap: var(--space-sm);
		box-sizing: border-box;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--card);
		padding: var(--space-sm);
		transition: border-color 0.12s ease;
		--accent: var(--primary);
	}
	.composer.is-focused {
		border-color: var(--accent);
	}
	.composer.is-disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	.leading,
	.trailing {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		flex: 0 0 auto;
	}

	textarea {
		flex: 1 1 auto;
		min-width: 0;
		display: block;
		box-sizing: border-box;
		resize: none;
		appearance: none;
		background: transparent;
		border: none;
		outline: none;
		color: var(--foreground);
		font-family: inherit;
		font-size: 0.9375rem;
		line-height: 1.5;
		padding: 0.4rem 0.25rem;
		max-height: 40vh;
		overflow-y: auto;
	}
	textarea::placeholder {
		color: var(--muted-foreground);
	}
`

export const ZComposer = c(
	(props) => {
		const [value, setValue] = useProp<string>('value')
		const [isFocused, setIsFocused] = useProp<boolean>('isFocused')
		const taRef = useRef<HTMLTextAreaElement>()

		const text = value ?? ''
		const hasText = text.trim().length > 0

		const autoGrow = () => {
			const ta = taRef.current
			if (!ta) return
			ta.style.height = 'auto'
			ta.style.height = `${ta.scrollHeight}px`
		}

		const send = () => {
			if (!hasText || props.isDisabled) return
			props.send({ value: text })
			setValue('')
			requestAnimationFrame(() => {
				const ta = taRef.current
				if (ta) ta.style.height = 'auto'
			})
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Enter' && !e.shiftKey && !props.disableEnterSubmit) {
				e.preventDefault()
				send()
			}
		}

		const composerClass = ['composer']
			.concat(isFocused ? ['is-focused'] : [])
			.concat(props.isDisabled ? ['is-disabled'] : [])
			.join(' ')

		return (
			<host shadowDom>
				<div class={composerClass}>
					<span class='leading'>
						<slot name='leading' />
					</span>
					<textarea
						ref={taRef}
						rows={1}
						value={text}
						placeholder={props.placeholder || 'Message…'}
						disabled={props.isDisabled}
						aria-label={props.placeholder || 'Message'}
						onfocus={() => setIsFocused(true)}
						onblur={() => setIsFocused(false)}
						onkeydown={onKeyDown}
						oninput={(e: any) => {
							setValue(e.target.value)
							autoGrow()
							props.input({ value: e.target.value })
						}}
					/>
					<span class='trailing'>
						<slot name='trailing'>
							<z-send-button is-disabled={!hasText} onsend={send} />
						</slot>
					</span>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true },
			placeholder: { type: String, reflect: true },
			isFocused: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			disableEnterSubmit: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			input: event<{ value: string }>({ bubbles: true, composed: true }),
			send: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-composer', ZComposer)
