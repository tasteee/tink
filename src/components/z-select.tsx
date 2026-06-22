import { c, css, event, useProp, useState, useHost, useEffect } from 'atomico'

/*
 * z-select — a custom dropdown. Trigger shows the selected label (or a
 * placeholder); the panel is a bordered, shadow-free popover that drops below.
 * Options are supplied as an `options` array property:
 *   el.options = [{ value, label, isDisabled? }]
 * Selection highlights with an accent tint. Keyboard: ↑/↓ move, Enter picks,
 * Esc closes. Clicking outside closes.
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

	.trigger {
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.625rem;
		width: 100%;
		box-sizing: border-box;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--foreground);
		font-family: inherit;
		cursor: pointer;
		text-align: left;
		transition: border-color 0.12s ease, background-color 0.12s ease;
	}

	.trigger.is-small {
		height: 2.25rem;
		padding-inline: 0.75rem;
		font-size: var(--font-size-small);
	}
	.trigger.is-medium {
		height: 2.75rem;
		padding-inline: 0.875rem;
		font-size: var(--font-size-body);
	}
	.trigger.is-large {
		height: 3.25rem;
		padding-inline: 1rem;
		font-size: var(--font-size-h4);
	}

	.trigger:hover {
		border-color: color-mix(in oklch, var(--foreground) 30%, transparent);
	}

	.trigger.is-open {
		border-color: var(--accent);
		background: color-mix(in oklch, var(--accent) 5%, transparent);
	}

	.trigger.is-invalid {
		border-color: var(--destructive);
	}

	.trigger.is-disabled {
		opacity: 0.55;
		pointer-events: none;
	}

	.trigger:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	.value.is-placeholder {
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
	}

	.trigger.is-open .chevron {
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
		justify-content: space-between;
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

	.tick {
		width: 0.875rem;
		height: 0.875rem;
		stroke: currentColor;
		stroke-width: 3;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.empty {
		padding: 0.625rem;
		font-size: var(--font-size-small);
		color: var(--muted-foreground);
		text-align: center;
	}
`

const resolveSizeClass = (props: any): string => {
	if (props.size === 'small') return 'is-small'
	if (props.size === 'large') return 'is-large'
	return 'is-medium'
}

type OptionT = { value: string; label: string; isDisabled?: boolean }

export const ZSelect = c(
	(props) => {
		const host = useHost()
		const [value, setValue] = useProp<string>('value')
		const [isOpen, setIsOpen] = useState(false)
		const [activeIndex, setActiveIndex] = useState(-1)

		const options: OptionT[] = Array.isArray(props.options) ? (props.options as OptionT[]) : []
		const selected = options.find((o) => o.value === value)

		useEffect(() => {
			if (!isOpen) return
			const onDocClick = (e: Event) => {
				if (!host.current.contains(e.target as Node)) setIsOpen(false)
			}
			document.addEventListener('mousedown', onDocClick)
			return () => document.removeEventListener('mousedown', onDocClick)
		}, [isOpen])

		const commit = (opt: OptionT) => {
			if (opt.isDisabled) return
			setValue(opt.value)
			setIsOpen(false)
			props.change({ value: opt.value })
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (props.isDisabled) return
			if (e.key === 'Escape') {
				setIsOpen(false)
				return
			}
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				if (!isOpen) {
					setIsOpen(true)
				} else if (activeIndex >= 0 && options[activeIndex]) {
					commit(options[activeIndex])
				}
				return
			}
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault()
				if (!isOpen) setIsOpen(true)
				const dir = e.key === 'ArrowDown' ? 1 : -1
				let next = activeIndex
				for (let i = 0; i < options.length; i++) {
					next = (next + dir + options.length) % options.length
					if (!options[next].isDisabled) break
				}
				setActiveIndex(next)
			}
		}

		const triggerClass = ['trigger', resolveSizeClass(props)]
			.concat(isOpen ? ['is-open'] : [])
			.concat(props.isInvalid ? ['is-invalid'] : [])
			.concat(props.isDisabled ? ['is-disabled'] : [])
			.join(' ')

		return (
			<host shadowDom>
				<button
					type="button"
					class={triggerClass}
					disabled={props.isDisabled}
					aria-haspopup="listbox"
					aria-expanded={isOpen ? 'true' : 'false'}
					onclick={() => setIsOpen(!isOpen)}
					onkeydown={onKeyDown}
				>
					<span class={selected ? 'value' : 'value is-placeholder'}>
						{selected ? selected.label : props.placeholder || 'Select…'}
					</span>
					<svg class="chevron" viewBox="0 0 24 24">
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>

				{isOpen && (
					<div class="panel" role="listbox">
						{options.length === 0 && <div class="empty">No options</div>}
						{options.map((opt, index) => {
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
									<span>{opt.label}</span>
									{opt.value === value && (
										<svg class="tick" viewBox="0 0 24 24">
											<polyline points="4 12 10 18 20 6" />
										</svg>
									)}
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
			size: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			isInvalid: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isInline: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-select', ZSelect)
