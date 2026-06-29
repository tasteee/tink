import { c, css, event, useRef, useProp, useState, useEffect } from 'atomico'

/*
 * z-command — a command palette (cmdk-style) on the native <dialog> foundation,
 * so focus trapping, Esc, and the backdrop are free. Commands come from an
 * `items` array:
 *   el.items = [{ value, label, group?, shortcut?, keywords?, isDisabled? }]
 * Typing filters by label + keywords; results stay grouped. Keyboard: ↑/↓ move
 * (skipping disabled), Enter runs, Esc closes. Open via `is-open` or a
 * [slot="trigger"]. Fires `select` with { value }.
 */
const styles = css`
	.trigger {
		display: inline-flex;
	}

	.command {
		box-sizing: border-box;
		width: min(36rem, calc(100vw - 2rem));
		max-height: 60vh;
		inset: 0;
		margin: 12vh auto auto;
		padding: 0;
		background: var(--popover);
		color: var(--popover-foreground);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.command[open] {
		display: flex;
		flex-direction: column;
	}

	.command::backdrop {
		background: color-mix(in oklch, var(--background) 55%, transparent);
		backdrop-filter: blur(3px);
	}

	.search {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid var(--border);
	}

	.search svg {
		width: 1.125rem;
		height: 1.125rem;
		flex-shrink: 0;
		color: var(--muted-foreground);
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.search input {
		flex: 1;
		min-width: 0;
		background: transparent;
		border: 0;
		outline: none;
		color: var(--foreground);
		font-family: inherit;
		font-size: var(--font-size-body);
	}

	.search input::placeholder {
		color: var(--muted-foreground);
	}

	.list {
		overflow-y: auto;
		padding: 0.375rem;
	}

	.group-label {
		padding: 0.5rem 0.625rem 0.25rem;
		font-size: var(--font-size-caption);
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	.item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.625rem;
		border-radius: var(--radius-sm);
		font-size: var(--font-size-small);
		color: var(--foreground);
		cursor: pointer;
		user-select: none;
		background: transparent;
		border: 0;
		font-family: inherit;
		text-align: left;
		width: 100%;
		box-sizing: border-box;
	}

	.item.is-active {
		background: color-mix(in oklch, var(--accent, var(--primary)) 14%, transparent);
		color: var(--accent, var(--primary));
	}

	.item.is-disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	.label {
		flex: 1;
	}

	.shortcut {
		color: var(--muted-foreground);
		font-family: var(--font-mono);
		font-size: var(--font-size-caption);
	}

	.empty {
		padding: 1.5rem;
		text-align: center;
		color: var(--muted-foreground);
		font-size: var(--font-size-small);
	}
`

type CommandT = {
	value?: string
	label: string
	group?: string
	shortcut?: string
	keywords?: string
	isDisabled?: boolean
}

export const ZCommand = c(
	(props) => {
		const dialogRef = useRef<HTMLDialogElement>()
		const inputRef = useRef<HTMLInputElement>()
		const listRef = useRef<HTMLDivElement>()
		const [isOpen, setIsOpen] = useProp<boolean>('isOpen')
		const [query, setQuery] = useState('')
		const [activeIndex, setActiveIndex] = useState(0)

		const items: CommandT[] = Array.isArray(props.items) ? (props.items as CommandT[]) : []
		const q = query.trim().toLowerCase()
		const filtered = items.filter((it) => !q || `${it.label} ${it.keywords || ''}`.toLowerCase().includes(q))

		// ordered unique groups for rendering
		const groups: string[] = []
		filtered.forEach((it) => {
			const g = it.group || ''
			if (!groups.includes(g)) groups.push(g)
		})

		useEffect(() => {
			const dialog = dialogRef.current
			if (!dialog) return
			if (isOpen && !dialog.open) {
				dialog.showModal()
				setQuery('')
				setActiveIndex(0)
				inputRef.current?.focus()
				props.open()
			} else if (!isOpen && dialog.open) {
				dialog.close()
			}
		}, [isOpen])

		useEffect(() => {
			const dialog = dialogRef.current
			if (!dialog) return
			const onClose = () => {
				if (isOpen) setIsOpen(false)
				props.close()
			}
			dialog.addEventListener('close', onClose)
			return () => dialog.removeEventListener('close', onClose)
		}, [isOpen])

		// keep the active row in view
		useEffect(() => {
			const node = listRef.current?.querySelector(`[data-index="${activeIndex}"]`)
			node?.scrollIntoView({ block: 'nearest' })
		}, [activeIndex])

		const selectable = (i: number) => filtered[i] && !filtered[i].isDisabled

		const commit = (item: CommandT) => {
			if (item.isDisabled) return
			setIsOpen(false)
			props.select({ value: item.value || item.label })
		}

		const onInput = (e: Event) => {
			setQuery((e.target as HTMLInputElement).value)
			setActiveIndex(0)
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault()
				const dir = e.key === 'ArrowDown' ? 1 : -1
				let next = activeIndex
				for (let i = 0; i < filtered.length; i++) {
					next = (next + dir + filtered.length) % filtered.length
					if (selectable(next)) break
				}
				setActiveIndex(next)
			} else if (e.key === 'Enter') {
				e.preventDefault()
				if (filtered[activeIndex]) commit(filtered[activeIndex])
			}
		}

		return (
			<host shadowDom style={{ '--accent': 'var(--purple)' }}>
				<div class="trigger" onclick={() => setIsOpen(true)}>
					<slot name="trigger" />
				</div>

				<dialog
					class="command"
					ref={dialogRef}
					onclick={(e: MouseEvent) => {
						if (e.target === dialogRef.current) setIsOpen(false)
					}}
				>
					<div class="search">
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<circle cx="11" cy="11" r="7" />
							<line x1="21" y1="21" x2="16.5" y2="16.5" />
						</svg>
						<input
							ref={inputRef}
							type="text"
							placeholder={props.placeholder || 'Type a command or search…'}
							value={query}
							oninput={onInput}
							onkeydown={onKeyDown}
							aria-label="Command search"
						/>
					</div>
					<div class="list" ref={listRef} role="listbox">
						{filtered.length === 0 && <div class="empty">{props.emptyText || 'No results found.'}</div>}
						{groups.map((group) => (
							<div key={group || '_'} role="group">
								{group && <div class="group-label">{group}</div>}
								{filtered.map((item, index) => {
									if ((item.group || '') !== group) return null
									const cls = ['item']
										.concat(index === activeIndex ? ['is-active'] : [])
										.concat(item.isDisabled ? ['is-disabled'] : [])
										.join(' ')
									return (
										<button
											key={item.value || item.label}
											type="button"
											class={cls}
											role="option"
											aria-selected={index === activeIndex ? 'true' : 'false'}
											data-index={index}
											disabled={item.isDisabled}
											onmousemove={() => setActiveIndex(index)}
											onclick={() => commit(item)}
										>
											<span class="label">{item.label}</span>
											{item.shortcut && <span class="shortcut">{item.shortcut}</span>}
										</button>
									)
								})}
							</div>
						))}
					</div>
				</dialog>
			</host>
		)
	},
	{
		props: {
			isOpen: { type: Boolean, reflect: true },
			items: { type: Array },
			placeholder: String,
			emptyText: String,
			select: event<{ value: string }>({ bubbles: true, composed: true }),
			open: event<void>({ bubbles: true, composed: true }),
			close: event<void>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-command', ZCommand)
