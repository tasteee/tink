import { c, css, event, useProp, useState, useHost, useEffect, useRef } from 'atomico'
import { themedScrollbarStyles } from '../shared/scrollbar-styles'

/*
 * z-combobox — a select you can type into. The trigger is a text input that
 * filters the option list as you type; matches highlight, Enter commits the
 * active row. Same shadow-free bordered popover as z-select. Options come from
 * an `options` array property: el.options = [{ value, label, isDisabled? }].
 */
const styles = css`
	:host {
		display: inline-flex;
		position: relative;
		width: 100%;
		--accent: var(--primary);
	}

	:host([tone='primary']) {
		--accent: var(--purple);
	}

	:host([tone='secondary']) {
		--accent: var(--pink);
	}

	:host([is-inline]) {
		width: auto;
	}

	:host([is-hidden]) {
		display: none;
	}

	.field {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		box-sizing: border-box;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		height: 2.75rem;
		padding-inline: 0.875rem;
		transition: border-color 0.12s ease, background-color 0.12s ease;
	}

	.field:hover {
		border-color: color-mix(in oklch, var(--foreground) 30%, transparent);
	}

	.field.is-open {
		border-color: var(--accent);
		background: color-mix(in oklch, var(--accent) 5%, transparent);
	}

	.field.is-disabled {
		opacity: 0.55;
		pointer-events: none;
	}

	input {
		flex: 1 1 auto;
		min-width: 0;
		appearance: none;
		background: transparent;
		border: none;
		outline: none;
		color: var(--foreground);
		font-family: inherit;
		font-size: var(--font-size-body);
	}

	input::placeholder {
		color: var(--muted-foreground);
	}

	.chevron {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--muted-foreground);
		transition: transform 0.15s ease;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
		cursor: pointer;
	}

	.field.is-open .chevron {
		transform: rotate(180deg);
		color: var(--accent);
	}

	.panel {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		right: 0;
		z-index: 50;
		background: var(--popover);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.3125rem;
		max-height: 16rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.625rem;
		border-radius: var(--radius-sm);
		font-size: var(--font-size-small);
		color: var(--foreground);
		cursor: pointer;
		user-select: none;
		white-space: nowrap;
	}

	.option.is-active {
		background: color-mix(in oklch, var(--accent) 14%, transparent);
		color: var(--accent);
	}

	.option.is-selected {
		color: var(--accent);
		font-weight: 600;
	}

	.option.is-disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	.empty {
		padding: 0.625rem;
		font-size: var(--font-size-small);
		color: var(--muted-foreground);
		text-align: center;
	}
`

type OptionT = { value: string; label: string; isDisabled?: boolean }

export const ZCombobox = c(
	(props) => {
		const host = useHost()
		const inputRef = useRef<HTMLInputElement>()
		const [value, setValue] = useProp<string>('value')
		const [isOpen, setIsOpen] = useState(false)
		const [query, setQuery] = useState('')
		const [activeIndex, setActiveIndex] = useState(0)

		const options: OptionT[] = Array.isArray(props.options) ? (props.options as OptionT[]) : []
		const selected = options.find((o) => o.value === value)

		const filtered = query
			? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
			: options

		useEffect(() => {
			if (!isOpen) return
			const onDocClick = (e: Event) => {
				if (!host.current.contains(e.target as Node)) {
					setIsOpen(false)
					setQuery('')
				}
			}
			document.addEventListener('mousedown', onDocClick)
			return () => document.removeEventListener('mousedown', onDocClick)
		}, [isOpen])

		const commit = (opt: OptionT) => {
			if (opt.isDisabled) return
			setValue(opt.value)
			setIsOpen(false)
			setQuery('')
			props.change({ value: opt.value })
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setIsOpen(false)
				setQuery('')
				return
			}
			if (e.key === 'Enter') {
				e.preventDefault()
				if (filtered[activeIndex]) commit(filtered[activeIndex])
				return
			}
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault()
				if (!isOpen) setIsOpen(true)
				const dir = e.key === 'ArrowDown' ? 1 : -1
				const len = filtered.length || 1
				setActiveIndex((activeIndex + dir + len) % len)
			}
		}

		const fieldClass = ['field']
			.concat(isOpen ? ['is-open'] : [])
			.concat(props.isDisabled ? ['is-disabled'] : [])
			.join(' ')

		const displayValue = isOpen ? query : selected ? selected.label : ''

		return (
			<host shadowDom>
				<div class={fieldClass}>
					<input
						ref={inputRef}
						type="text"
						value={displayValue}
						placeholder={props.placeholder || 'Search…'}
						disabled={props.isDisabled}
						role="combobox"
						aria-expanded={isOpen ? 'true' : 'false'}
						aria-autocomplete="list"
						onfocus={() => setIsOpen(true)}
						oninput={(e: any) => {
							setQuery(e.target.value)
							setActiveIndex(0)
							setIsOpen(true)
						}}
						onkeydown={onKeyDown}
					/>
					<svg
						class="chevron"
						viewBox="0 0 24 24"
						onclick={() => {
							setIsOpen(!isOpen)
							inputRef.current?.focus()
						}}
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</div>

				{isOpen && (
					<div class="panel" role="listbox">
						{filtered.length === 0 && <div class="empty">No matches</div>}
						{filtered.map((opt, index) => {
							const optClass = ['option']
								.concat(index === activeIndex ? ['is-active'] : [])
								.concat(opt.value === value ? ['is-selected'] : [])
								.concat(opt.isDisabled ? ['is-disabled'] : [])
								.join(' ')
							return (
								<div
									key={opt.value}
									class={optClass}
									role="option"
									aria-selected={opt.value === value ? 'true' : 'false'}
									onmouseenter={() => setActiveIndex(index)}
									onclick={() => commit(opt)}
								>
									{opt.label}
								</div>
							)
						})}
					</div>
				)}
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true },
			placeholder: String,
			options: { type: Array },
			tone: { type: String, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isInline: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles: [themedScrollbarStyles, styles]
	}
)

customElements.define('z-combobox', ZCombobox)
