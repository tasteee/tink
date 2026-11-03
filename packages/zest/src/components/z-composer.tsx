import { defineElement } from '../shared/define-element'
import { c, css, event, useProp, useRef } from 'atomico'
import { themedScrollbarStyles } from '../shared/scrollbar-styles'

/*
 * z-composer, the message input row: an auto-growing textarea flanked by a
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
		transition: border-color var(--motion-fast) var(--ease-enter);
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

	.send {
		display: inline-grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0;
		border: 0;
		border-radius: 999px;
		background: var(--primary);
		color: var(--primary-foreground);
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		transition: opacity var(--motion-fast) var(--ease-enter), transform 0.08s ease;
	}
	.send:hover:not(:disabled) { transform: scale(1.05); }
	.send:active:not(:disabled) { transform: scale(0.95); }
	.send:disabled { opacity: 0.4; cursor: default; }
	.send svg { width: 1.1rem; height: 1.1rem; stroke: currentColor; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
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
			if (e.key === 'Enter' && !e.shiftKey && !props.isEnterSubmitDisabled) {
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
					<span class="leading">
						<slot name="leading" />
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
							<button class='send' type='button' disabled={!hasText || props.isDisabled} aria-label='Send' onclick={send}>
								<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M12 19V5M5 12l7-7 7 7' /></svg>
							</button>
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
			isEnterSubmitDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			input: event<{ value: string }>({ bubbles: true, composed: true }),
			send: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles: [themedScrollbarStyles, styles]
	}
)

defineElement('z-composer', ZComposer)
