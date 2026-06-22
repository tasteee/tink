import { c, css, event, useProp, useHost } from 'atomico'

/*
 * z-input-otp — a row of single-character cells for one-time codes. Typing
 * auto-advances, Backspace steps back, and pasting a full code fills every
 * cell at once. Each cell is a hairline box that lifts to the accent on focus;
 * the active/filled cells read with the accent color. Emits `change` with the
 * full string and `complete` when every cell is filled.
 */
const styles = css`
	:host {
		display: inline-flex;
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

	.cells {
		display: inline-flex;
		gap: 0.5rem;
	}

	.cell {
		width: 2.75rem;
		height: 3.25rem;
		text-align: center;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--foreground);
		font-family: var(--font-mono);
		font-size: var(--font-size-h3);
		font-weight: 600;
		caret-color: var(--accent);
		transition: border-color 0.12s ease, background-color 0.12s ease, color 0.12s ease;
		appearance: none;
		outline: none;
		box-sizing: border-box;
	}

	.cell.is-small {
		width: 2.25rem;
		height: 2.75rem;
		font-size: var(--font-size-h4);
	}
	.cell.is-large {
		width: 3.25rem;
		height: 3.75rem;
		font-size: var(--font-size-h2);
	}

	.cell:hover {
		border-color: color-mix(in oklch, var(--foreground) 30%, transparent);
	}

	.cell.is-filled {
		color: var(--accent);
		/* srgb: oklch drifts the hue when mixing --accent against the hue-carrying --border. */
		border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
	}

	.cell:focus {
		border-color: var(--accent);
		background: color-mix(in oklch, var(--accent) 6%, transparent);
		outline: 3px solid color-mix(in oklch, var(--ring) 40%, transparent);
		outline-offset: 1px;
	}

	.cell.is-invalid {
		border-color: var(--destructive);
		color: var(--destructive);
	}

	.cell:disabled {
		opacity: 0.5;
		pointer-events: none;
	}
`

const resolveSizeClass = (props: any): string => {
	if (props.size === 'small') return 'is-small'
	if (props.size === 'large') return 'is-large'
	return ''
}

export const ZInputOtp = c(
	(props) => {
		const host = useHost()
		const [value, setValue] = useProp<string>('value')

		const length = props.length || 6
		const chars = (value || '').slice(0, length).split('')
		const sizeClass = resolveSizeClass(props)

		const focusCell = (index: number) => {
			const root = host.current.shadowRoot
			const cell = root?.querySelectorAll<HTMLInputElement>('.cell')[index]
			cell?.focus()
			cell?.select()
		}

		const setCharAt = (index: number, char: string) => {
			const arr = (value || '').padEnd(length, ' ').slice(0, length).split('')
			arr[index] = char || ' '
			const next = arr.join('').replace(/ /g, ' ').trimEnd()
			setValue(next)
			props.change({ value: next.replace(/\s/g, '') })
			if (next.replace(/\s/g, '').length === length) props.complete({ value: next.replace(/\s/g, '') })
		}

		const onInput = (index: number) => (e: any) => {
			const raw: string = e.target.value
			const char = raw.slice(-1)
			if (props.isNumeric && char && !/[0-9]/.test(char)) {
				e.target.value = chars[index] || ''
				return
			}
			setCharAt(index, char)
			if (char && index < length - 1) focusCell(index + 1)
		}

		const onKeyDown = (index: number) => (e: KeyboardEvent) => {
			if (e.key === 'Backspace') {
				if (!chars[index] && index > 0) {
					focusCell(index - 1)
					setCharAt(index - 1, '')
					e.preventDefault()
				} else {
					setCharAt(index, '')
				}
			} else if (e.key === 'ArrowLeft' && index > 0) {
				focusCell(index - 1)
			} else if (e.key === 'ArrowRight' && index < length - 1) {
				focusCell(index + 1)
			}
		}

		const onPaste = (e: ClipboardEvent) => {
			e.preventDefault()
			let pasted = (e.clipboardData?.getData('text') || '').trim()
			if (props.isNumeric) pasted = pasted.replace(/[^0-9]/g, '')
			pasted = pasted.slice(0, length)
			if (!pasted) return
			setValue(pasted)
			props.change({ value: pasted })
			if (pasted.length === length) {
				props.complete({ value: pasted })
				focusCell(length - 1)
			} else {
				focusCell(pasted.length)
			}
		}

		return (
			<host shadowDom>
				<div class="cells" role="group" aria-label="One-time code" onpaste={onPaste}>
					{Array.from({ length }).map((_, index) => {
						const ch = chars[index] && chars[index] !== ' ' ? chars[index] : ''
						const cellClass = ['cell', sizeClass]
							.filter(Boolean)
							.concat(ch ? ['is-filled'] : [])
							.concat(props.isInvalid ? ['is-invalid'] : [])
							.join(' ')
						return (
							<input
								key={index}
								class={cellClass}
								type="text"
								inputmode={props.isNumeric ? 'numeric' : 'text'}
								maxlength={1}
								value={ch}
								disabled={props.isDisabled}
								aria-label={`Digit ${index + 1}`}
								oninput={onInput(index)}
								onkeydown={onKeyDown(index)}
								onfocus={(e: any) => e.target.select()}
							/>
						)
					})}
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true },
			length: { type: Number, reflect: true },
			size: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			isNumeric: { type: Boolean, reflect: true },
			isInvalid: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ value: string }>({ bubbles: true, composed: true }),
			complete: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-input-otp', ZInputOtp)
