import { c, css, event, useState, useHost, useEffect } from 'atomico'

/*
 * z-menu — a dropdown menu. The trigger is whatever you slot into
 * [slot="trigger"] (typically a <z-button>); the menu items come from an
 * `items` array property:
 *   el.items = [{ value, label, icon?, shortcut?, isDisabled?, isSeparator?, isDanger? }]
 * The panel is a bordered, shadow-free popover. Keyboard: ↑/↓ move (skipping
 * separators and disabled rows), Enter/Space pick, Esc closes; clicking outside
 * closes. Fires `select` with { value } on pick.
 */
const styles = css`
	:host {
		display: inline-flex;
		position: relative;
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

	.panel {
		position: absolute;
		top: calc(100% + 6px);
		z-index: 50;
		min-width: max(12rem, 100%);
		background: var(--popover);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.3125rem;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	:host([align='end']) .panel {
		right: 0;
	}

	:host(:not([align='end'])) .panel {
		left: 0;
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
		white-space: nowrap;
		background: transparent;
		border: 0;
		font-family: inherit;
		text-align: left;
		width: 100%;
		box-sizing: border-box;
	}

	.item.is-active {
		background: color-mix(in oklch, var(--accent) 14%, transparent);
		color: var(--accent);
	}

	.item.is-danger {
		color: var(--destructive);
	}

	.item.is-danger.is-active {
		background: color-mix(in oklch, var(--destructive) 14%, transparent);
		color: var(--destructive);
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

	.sep {
		height: 1px;
		margin: 0.3125rem 0;
		background: var(--border);
	}

	::slotted([slot='trigger']) {
		cursor: pointer;
	}

	.icon {
		display: inline-flex;
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}
`

type MenuItemT = {
	value?: string
	label?: string
	icon?: string
	shortcut?: string
	isDisabled?: boolean
	isSeparator?: boolean
	isDanger?: boolean
}

export const ZMenu = c(
	(props) => {
		const host = useHost()
		const [isOpen, setIsOpen] = useState(false)
		const [activeIndex, setActiveIndex] = useState(-1)

		const items: MenuItemT[] = Array.isArray(props.items) ? (props.items as MenuItemT[]) : []
		const selectable = (i: number) => items[i] && !items[i].isSeparator && !items[i].isDisabled

		useEffect(() => {
			if (!isOpen) return
			const onDocClick = (e: Event) => {
				if (!host.current.contains(e.target as Node)) setIsOpen(false)
			}
			document.addEventListener('mousedown', onDocClick)
			return () => document.removeEventListener('mousedown', onDocClick)
		}, [isOpen])

		const close = () => {
			setIsOpen(false)
			setActiveIndex(-1)
		}

		const commit = (item: MenuItemT) => {
			if (item.isSeparator || item.isDisabled) return
			close()
			props.select({ value: item.value || item.label || '' })
		}

		const move = (dir: number) => {
			let next = activeIndex
			for (let i = 0; i < items.length; i++) {
				next = (next + dir + items.length) % items.length
				if (selectable(next)) break
			}
			setActiveIndex(next)
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				close()
				return
			}
			if (e.key === 'ArrowDown') {
				e.preventDefault()
				if (!isOpen) setIsOpen(true)
				else move(1)
				return
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault()
				if (!isOpen) setIsOpen(true)
				else move(-1)
				return
			}
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				if (!isOpen) setIsOpen(true)
				else if (activeIndex >= 0 && items[activeIndex]) commit(items[activeIndex])
			}
		}

		return (
			<host shadowDom onkeydown={onKeyDown}>
				<div
					class="trigger"
					aria-haspopup="menu"
					aria-expanded={isOpen ? 'true' : 'false'}
					onclick={() => setIsOpen(!isOpen)}
				>
					<slot name="trigger" />
				</div>

				{isOpen && (
					<div class="panel" role="menu">
						{items.map((item, index) => {
							if (item.isSeparator) return <div key={`sep-${index}`} class="sep" role="separator" />
							const cls = ['item']
								.concat(index === activeIndex ? ['is-active'] : [])
								.concat(item.isDanger ? ['is-danger'] : [])
								.concat(item.isDisabled ? ['is-disabled'] : [])
								.join(' ')
							return (
								<button
									key={item.value || item.label || index}
									type="button"
									class={cls}
									role="menuitem"
									disabled={item.isDisabled}
									onmouseenter={() => setActiveIndex(index)}
									onclick={() => commit(item)}
								>
									{item.icon && <span class="icon" innerHTML={item.icon} />}
									<span class="label">{item.label}</span>
									{item.shortcut && <span class="shortcut">{item.shortcut}</span>}
								</button>
							)
						})}
					</div>
				)}
			</host>
		)
	},
	{
		props: {
			items: { type: Array },
			align: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			select: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-menu', ZMenu)
