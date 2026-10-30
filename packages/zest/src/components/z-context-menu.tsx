import { c, css, event, useRef, useState, useEffect, useHost } from 'atomico'
import { useChildItems, hasFlag } from '../shared/child-items'
import { flashThen } from '../shared/menu-nav'
import { showFloating, hideFloating } from '../shared/overlay'

/*
 * z-context-menu, a right-click menu. Wrap the target in the default slot; a
 * contextmenu gesture opens a top-layer ([popover=manual]) menu at the cursor,
 * clamped to the viewport (and opening leftward/upward when it would overflow).
 * Rich controls can be supplied in the `controls` slot. Items are the same
 * declarative <z-menu-item> / <z-menu-separator> children z-menu takes, or an
 * `items` array of the same shape:
 *   el.items = [{ value, label, shortcut?, isDisabled?, isSeparator?, isDanger? }]
 * Keyboard: ↑/↓ move, Enter picks, Esc closes; outside-click and scroll close.
 * A pick double-flashes the row, then fires `select` with { value } as the
 * panel transitions out.
 */
const styles = css`
	:host {
		display: contents;
		--accent: var(--primary);
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
		transform-origin: top left;
		opacity: 0;
		scale: var(--motion-scale-from);
		transition:
			opacity var(--motion-exit-fast) var(--ease-exit),
			scale var(--motion-exit-fast) var(--ease-exit);
	}

	.panel[data-state='open'] {
		opacity: 1;
		scale: 1;
		transition:
			opacity var(--motion-fast) var(--ease-enter),
			scale var(--motion-fast) var(--ease-enter);
	}

	.panel.is-committing {
		pointer-events: none;
	}

	.item.is-flashing {
		animation: z-menu-flash 130ms step-end;
	}

	@keyframes z-menu-flash {
		0%,
		50% {
			background: color-mix(in oklch, var(--accent) 14%, transparent);
		}
		25%,
		75% {
			background: transparent;
		}
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
	/** slot name carrying a z-menu-item's own content */
	slot?: string
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

		const [flashIndex, setFlashIndex] = useState(-1)
		const isCommitting = flashIndex >= 0
		const childItems: MenuItemT[] = useChildItems(
			['z-menu-item', 'z-menu-separator'],
			['shortcut', 'is-disabled', 'is-danger']
		).map((child) =>
			child.tag === 'z-menu-separator'
				? { isSeparator: true }
				: {
						value: child.value,
						label: child.label,
						shortcut: child.attributes.shortcut || undefined,
						isDisabled: hasFlag(child, 'is-disabled'),
						isDanger: hasFlag(child, 'is-danger'),
						slot: child.slot
					}
		)
		const items: MenuItemT[] = [...childItems, ...(Array.isArray(props.items) ? (props.items as MenuItemT[]) : [])]
		const selectable = (i: number) => items[i] && !items[i].isSeparator && !items[i].isDisabled

		useEffect(() => {
			const floating = floatRef.current
			if (!floating || !isOpen) {
				if (floating) hideFloating(floating)
				return
			}
			showFloating(floating)
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
			// button is ignored here, reopening at a new spot is handled by openAt.
			const onDocDown = (e: Event) => {
				if ((e as MouseEvent).button === 2) return
				if (!e.composedPath().includes(floating)) setIsOpen(false)
			}
			const onKey = (e: KeyboardEvent) => {
				if (e.key === 'Escape') setIsOpen(false)
			}
			const onScroll = () => setIsOpen(false)
			document.addEventListener('pointerdown', onDocDown)
			document.addEventListener('keydown', onKey)
			window.addEventListener('scroll', onScroll, true)
			return () => {
				document.removeEventListener('pointerdown', onDocDown)
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

		const commit = (item: MenuItemT, index: number) => {
			if (item.isSeparator || item.isDisabled || isCommitting) return
			setActiveIndex(index)
			setFlashIndex(index)
			flashThen(() => {
				setFlashIndex(-1)
				setIsOpen(false)
				props.select({ value: item.value || item.label || '' })
			})
		}

		const onMenuKeyDown = (e: KeyboardEvent) => {
			if (isCommitting) return
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
				commit(items[activeIndex], activeIndex)
			}
		}

		return (
			<host shadowDom>
				<div class="target" oncontextmenu={openAt}>
					<slot />
				</div>
				<div
					ref={floatRef}
					class={isCommitting ? 'panel is-committing' : 'panel'}
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
							.concat(index === flashIndex ? ['is-flashing'] : [])
							.join(' ')
						return (
							<button
								key={item.slot || item.value || item.label || index}
								type="button"
								class={cls}
								role="menuitem"
								data-index={index}
								disabled={item.isDisabled}
								onmouseenter={() => !isCommitting && setActiveIndex(index)}
								onclick={() => commit(item, index)}
							>
								<span class="label">{item.slot ? <slot name={item.slot} /> : item.label}</span>
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
