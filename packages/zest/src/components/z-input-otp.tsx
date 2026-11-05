import { defineFormElement, useFormControl } from '../shared/form-control'
import { useLocale } from '../shared/locale'
import { c, css, event, useProp, useHost, useRef } from 'atomico'
import { oneOf } from '../shared/prop-types'

/*
 * z-input-otp, a row of single-character cells for one-time codes. Typing
 * auto-advances, Backspace steps back, and pasting a full code fills every
 * cell at once. Each cell is a hairline box that lifts to the accent on focus;
 * the active/filled cells read with the accent color.
 *
 * `value` is positionally faithful to the cells: clearing a middle cell leaves
 * a hole rather than sliding the rest back, and that hole is held as a space.
 * `change` emits exactly that string, so the event and the property never
 * disagree; `complete` fires only once every cell is filled with no holes.
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
		transition:
			border-color var(--motion-fast) var(--ease-enter),
			background-color var(--motion-fast) var(--ease-enter),
			color var(--motion-fast) var(--ease-enter);
		appearance: none;
		outline: none;
		box-sizing: border-box;
	}

	.cell.is-sm {
		width: 2.25rem;
		height: 2.75rem;
		font-size: var(--font-size-h4);
	}
	.cell.is-lg {
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
		outline: 3px solid var(--focus-ring);
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
	if (props.size === 'sm') return 'is-sm'
	if (props.size === 'lg') return 'is-lg'
	return ''
}

export const ZInputOtp = c(
	(props) => {
		const host = useHost()
		const t = useLocale()
		const [value, setValue] = useProp<string>('value')
		const defaultValue = useRef(value ?? '')
		const firstCellRef = useRef<HTMLInputElement>()

		const length = props.length || 6
		const chars = (value || '').slice(0, length).split('')
		// The code is one value split across cells: submitted whole, required
		// means every cell filled, and the bubble anchors to the first cell.
		const isComplete = chars.length === length && chars.every((char) => char !== '')
		const { isFormDisabled } = useFormControl({
			value: value ?? '',
			isDisabled: props.isDisabled,
			control: firstCellRef,
			validity: props.isRequired && !isComplete
				? { flags: { valueMissing: true }, message: t('enterTheCode', { length }) }
				: { flags: {} },
			onReset: () => setValue(defaultValue.current),
			onRestore: (state) => { if (typeof state === 'string') setValue(state) }
		})
		const isDisabled = props.isDisabled || isFormDisabled
		const sizeClass = resolveSizeClass(props)

		const focusCell = (index: number) => {
			const root = host.current.shadowRoot
			const cell = root?.querySelectorAll<HTMLInputElement>('.cell')[index]
			cell?.focus()
			cell?.select()
		}

		// Clearing a middle cell leaves a real hole, and the characters after it
		// must not slide back a position — the user would watch their code
		// rewrite itself. A hole is held as a space so the value stays
		// positionally faithful to the cells; only trailing holes are dropped.
		const buildValueWithCharAt = (index: number, char: string): string => {
			const slots = (value || '').padEnd(length, ' ').slice(0, length).split('')
			slots[index] = char || ' '
			return slots.join('').trimEnd()
		}

		const checkIsComplete = (candidate: string): boolean => {
			return candidate.length === length && !candidate.includes(' ')
		}

		const emit = (next: string) => {
			setValue(next)
			props.change({ value: next })
			if (checkIsComplete(next)) props.complete({ value: next })
		}

		const setCharAt = (index: number, char: string) => {
			emit(buildValueWithCharAt(index, char))
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
			const clipboardText = e.clipboardData?.getData('text') || ''

			// Whitespace is the hole marker, so it can never be a real
			// character — strip it rather than letting a pasted "12 4 56"
			// masquerade as a code with gaps in it.
			const stripped = props.isNumeric ? clipboardText.replace(/[^0-9]/g, '') : clipboardText.replace(/\s/g, '')
			const pasted = stripped.slice(0, length)

			const hasPastedText = pasted.length > 0
			if (!hasPastedText) return

			emit(pasted)

			const isFull = pasted.length === length
			focusCell(isFull ? length - 1 : pasted.length)
		}

		return (
			<host shadowDom>
				<div
					class="cells"
					role="group"
					aria-label={props.label || host.current?.getAttribute('aria-label') || 'One-time code'}
					onpaste={onPaste}
				>
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
								ref={index === 0 ? firstCellRef : undefined}
								disabled={isDisabled}
								aria-label={t('digitOf', { index: index + 1, length })}
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
			label: String,
			length: { type: Number, reflect: true },
			size: { type: oneOf('sm', 'md', 'lg'), reflect: true },
			tone: { type: oneOf('primary', 'secondary'), reflect: true },
			isNumeric: { type: Boolean, reflect: true },
			name: { type: String, reflect: true },
			isRequired: { type: Boolean, reflect: true },
			isInvalid: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ value: string }>({ bubbles: true, composed: true }),
			complete: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles,
		form: true
	}
)

defineFormElement('z-input-otp', ZInputOtp)
