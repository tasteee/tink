import { c, css, event, useRef, useState, useEffect, useHost } from 'atomico'

/*
 * z-context-menu — a right-click menu. Wrap the target in the default slot; a
 * contextmenu gesture opens a top-layer ([popover=manual]) menu at the cursor,
 * clamped to the viewport (and opening leftward/upward when it would overflow).
 * Rich controls can be supplied in the `controls` slot. Items come from an
 * `items` array, same shape as z-menu:
 *   el.items = [{ value, label, shortcut?, isDisabled?, isSeparator?, isDanger? }]
 * Keyboard: ↑/↓ move, Enter picks, Esc closes; outside-click and scroll close.
 * Fires `select` with { value }.
 */
const styles = css`
	:host {
		display: contents;
	}

	:host([tone='primary']) {
		--accent: var(--purple);
	}
	:host([tone='secondary']) {
		--accent: var(--pink);
	}

	.target {
		display: contents;
	}

	.panel {
		position: fixed;
		left: 0;
		top: 0;
		margin: 0;
		z-index: 50;
		min-width: 12rem;
		background: var(--popover);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.3125rem;
		--accent: var(--primary);
	}

	/* The Popover API hides a closed popover via a UA display:none rule; setting
	   an author display value would override it and keep the panel always visible,
	   so the flex layout is only applied once the popover is actually open. */
	.panel:popover-open {
		display: flex;
		flex-direction: column;
		gap: 1px;
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

	.controls {
		display: contents;
	}

	::slotted([slot='controls']) {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		min-width: 15rem;
		padding: 0.5rem;
	}

	::slotted([slot='controls']:not(:only-child)) {
		margin-bottom: 0.3125rem;
	}
`

type MenuItemT = {
	value?: string
	label?: string
	shortcut?: string
	isDisabled?: boolean
	isSeparator?: boolean
	isDanger?: boolean
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max))

export const ZContextMenu = c(
	(props) => {
		const host = useHost()
		const floatRef = useRef<HTMLDivElement>()
		// point is state (not a ref) so re-right-clicking while already open
		// changes a dep and re-runs the positioning effect.
		const [point, setPoint] = useState({ x: 0, y: 0 })
		const [isOpen, setIsOpen] = useState(false)
		const [activeIndex, setActiveIndex] = useState(-1)

		const items: MenuItemT[] = Array.isArray(props.items) ? (props.items as MenuItemT[]) : []
		const selectable = (i: number) => items[i] && !items[i].isSeparator && !items[i].isDisabled

		useEffect(() => {
			const floating = floatRef.current
			if (!floating || !isOpen) {
				if (floating && floating.matches(':popover-open')) floating.hidePopover()
				return
			}
			if (!floating.matches(':popover-open')) floating.showPopover()
			const pad = 8
			const fw = floating.offsetWidth
			const fh = floating.offsetHeight
			const vw = document.documentElement.clientWidth
			const vh = document.documentElement.clientHeight
			let { x, y } = point
			if (x + fw > vw - pad) x = Math.max(pad, x - fw)
			if (y + fh > vh - pad) y = Math.max(pad, y - fh)
			floating.style.left = `${clamp(x, pad, vw - fw - pad)}px`
			floating.style.top = `${clamp(y, pad, vh - fh - pad)}px`

			// Dismiss on any pointer/scroll/Esc outside the menu panel. composedPath
			// pierces the shadow boundary, so item clicks (inside the panel) keep it
			// open, while clicks on the trigger or anywhere else close it. The right
			// button is ignored here — reopening at a new spot is handled by openAt.
			const onDocDown = (e: Event) => {
				if ((e as MouseEvent).button === 2) return
				if (!e.composedPath().includes(floating)) setIsOpen(false)
			}
			const onKey = (e: KeyboardEvent) => {
				if (e.key === 'Escape') setIsOpen(false)
			}
			const onScroll = () => setIsOpen(false)
			document.addEventListener('mousedown', onDocDown)
			document.addEventListener('keydown', onKey)
			window.addEventListener('scroll', onScroll, true)
			return () => {
				document.removeEventListener('mousedown', onDocDown)
				document.removeEventListener('keydown', onKey)
				window.removeEventListener('scroll', onScroll, true)
			}
		}, [isOpen, point])

		const openAt = (e: MouseEvent) => {
			if (props.isDisabled) return
			e.preventDefault()
			setPoint({ x: e.clientX, y: e.clientY })
			setActiveIndex(-1)
			setIsOpen(true)
		}

		const commit = (item: MenuItemT) => {
			if (item.isSeparator || item.isDisabled) return
			setIsOpen(false)
			props.select({ value: item.value || item.label || '' })
		}

		const onMenuKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault()
				const dir = e.key === 'ArrowDown' ? 1 : -1
				let next = activeIndex
				for (let i = 0; i < items.length; i++) {
					next = (next + dir + items.length) % items.length
					if (selectable(next)) break
				}
				setActiveIndex(next)
			} else if ((e.key === 'Enter' || e.key === ' ') && activeIndex >= 0 && items[activeIndex]) {
				e.preventDefault()
				commit(items[activeIndex])
			}
		}

		return (
			<host shadowDom>
				<div class="target" oncontextmenu={openAt}>
					<slot />
				</div>
				<div
					ref={floatRef}
					class="panel"
					popover="manual"
					role="menu"
					onmousedown={(event) => event.stopPropagation()}
					onclick={(event) => event.stopPropagation()}
					onkeydown={onMenuKeyDown}
				>
					<div class="controls">
						<slot name="controls" />
					</div>
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
								<span class="label">{item.label}</span>
								{item.shortcut && <span class="shortcut">{item.shortcut}</span>}
							</button>
						)
					})}
				</div>
			</host>
		)
	},
	{
		props: {
			items: { type: Array },
			tone: { type: String, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			select: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-context-menu', ZContextMenu)
