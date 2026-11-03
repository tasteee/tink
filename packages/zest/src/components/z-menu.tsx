import { interactionStyles } from '../shared/interaction-styles'
import { c, css, event, useState, useHost, useEffect, useRef } from 'atomico'
import { oneOf } from '../shared/prop-types'
import { useChildItems, hasFlag } from '../shared/child-items'
import { flashThen } from '../shared/menu-nav'
import { useVisibilityPhase } from '../shared/transition'

/*
 * z-menu, a dropdown menu. The trigger is whatever you slot into
 * [slot="trigger"] (typically a <z-button>). Items are declarative children,
 * whose own content becomes the row (icons, hints, anything):
 *   <z-menu-item value="rename" shortcut="⌘R">Rename</z-menu-item>
 *   <z-menu-separator></z-menu-separator>
 *   <z-menu-item value="delete" is-danger>Delete</z-menu-item>
 * or an `items` array property for data-driven menus:
 *   el.items = [{ value, label, icon?, shortcut?, isDisabled?, isSeparator?, isDanger? }]
 * The panel is a bordered, shadow-free popover. Keyboard, per the WAI-ARIA
 * menu button pattern: ↓ / Enter / Space open and focus the first item, ↑
 * opens and focuses the last; inside, ↑/↓ move (wrapping, skipping
 * separators and disabled rows), Home/End jump, typing a letter jumps to the
 * next item starting with it, Enter/Space pick, Esc and Tab close. Closing
 * returns focus to the trigger. Clicking outside closes. Fires `select` with
 * { value } on pick.
 */
const styles = css`
	:host {
		display: inline-flex;
		position: relative;
		--accent: var(--primary);
		user-select: none;
		-webkit-user-select: none;
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

	/* enters on mount, exits via .is-closing while useVisibilityPhase keeps it rendered */
	.panel {
		transform-origin: top left;
		animation: z-menu-in var(--motion-fast) var(--ease-enter);
	}

	:host([align='end']) .panel {
		transform-origin: top right;
	}

	.panel.is-closing {
		opacity: 0;
		scale: var(--motion-scale-from);
		pointer-events: none;
		transition:
			opacity var(--motion-exit-fast) var(--ease-exit),
			scale var(--motion-exit-fast) var(--ease-exit);
	}

	.panel.is-committing {
		pointer-events: none;
	}

	@keyframes z-menu-in {
		from {
			opacity: 0;
			scale: var(--motion-scale-from);
			translate: 0 calc(var(--motion-distance-sm) * -1 * var(--motion-travel));
		}
	}

	.item.is-flashing {
		animation: z-menu-flash 200ms step-end;
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

	:host([align='end']) .panel {
		inset-inline-end: 0;
	}

	:host(:not([align='end'])) .panel {
		inset-inline-start: 0;
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
		text-align: start;
		width: 100%;
		box-sizing: border-box;
	}

	.item.is-active {
		background: color-mix(in oklch, var(--accent) 14%, transparent);
		color: var(--accent);
	}

	.item.is-error {
		color: var(--destructive);
	}

	.item.is-error.is-active {
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
	/** slot name carrying a z-menu-item's own content */
	slot?: string
}

const ITEM_ATTRIBUTES = ['shortcut', 'is-disabled', 'is-danger']

export const ZMenu = c(
	(props) => {
		const host = useHost()
		const triggerSlotRef = useRef<HTMLSlotElement>()
		const search = useRef({ text: '', time: 0 })
		const [isOpen, setIsOpen] = useState(false)
		const [activeIndex, setActiveIndex] = useState(-1)
		const [flashIndex, setFlashIndex] = useState(-1)
		const isCommitting = flashIndex >= 0
		const phase = useVisibilityPhase(isOpen, 140)

		const childItems: MenuItemT[] = useChildItems(['z-menu-item', 'z-menu-separator'], ITEM_ATTRIBUTES).map((child) =>
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
		const selectableIndices = items.flatMap((_, index) => selectable(index) ? [index] : [])

		// Focus follows the active item, so a screen reader announces each
		// menuitem as the user moves; the trigger gets focus back on close.
		useEffect(() => {
			const hasActiveItem = activeIndex >= 0
			const canFocusItem = isOpen && hasActiveItem
			if (!canFocusItem) return
			host.current.shadowRoot?.querySelector<HTMLButtonElement>(`#menu-item-${activeIndex}`)?.focus()
		}, [isOpen, activeIndex])
		const triggerElement = () => triggerSlotRef.current?.assignedElements({ flatten: true })[0] as HTMLElement | undefined
		const focusTrigger = () => triggerElement()?.focus()
		// aria-haspopup / aria-expanded describe the trigger, which is slotted
		// light DOM; a wrapper div without a role may not carry them.
		const syncTriggerAria = () => {
			const trigger = triggerElement()
			if (!trigger) return
			// A Zest button is itself a host; the attributes go on its inner control.
			const control = trigger.shadowRoot?.querySelector('button, [role]') ?? trigger
			control.setAttribute('aria-haspopup', 'menu')
			control.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
		}
		useEffect(syncTriggerAria, [isOpen])
		const openAt = (index: number) => {
			setIsOpen(true)
			setActiveIndex(index)
		}

		useEffect(() => {
			if (!isOpen) return
			const onDocumentPointerDown = (e: Event) => {
				if (!e.composedPath().includes(host.current as EventTarget)) setIsOpen(false)
			}
			document.addEventListener('pointerdown', onDocumentPointerDown)
			return () => document.removeEventListener('pointerdown', onDocumentPointerDown)
		}, [isOpen])

		const close = (returnFocus = true) => {
			const wasOpen = isOpen
			setIsOpen(false)
			setActiveIndex(-1)
			if (wasOpen && returnFocus) focusTrigger()
		}

		const commit = (item: MenuItemT, index: number) => {
			if (item.isSeparator || item.isDisabled || isCommitting) return
			setActiveIndex(index)
			setFlashIndex(index)
			flashThen(() => {
				setFlashIndex(-1)
				close()
				props.select({ value: item.value || item.label || '' })
			})
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
			if (isCommitting) return
			if (e.key === 'Escape') {
				if (isOpen) { e.preventDefault(); e.stopPropagation() }
				close()
				return
			}
			if (e.key === 'Tab') {
				close(false)
				return
			}
			if (e.key === 'ArrowDown') {
				e.preventDefault()
				if (!isOpen) openAt(selectableIndices[0] ?? -1)
				else move(1)
				return
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault()
				if (!isOpen) openAt(selectableIndices.at(-1) ?? -1)
				else move(-1)
				return
			}
			if (e.key === 'Home' && isOpen) { e.preventDefault(); setActiveIndex(selectableIndices[0] ?? -1); return }
			if (e.key === 'End' && isOpen) { e.preventDefault(); setActiveIndex(selectableIndices.at(-1) ?? -1); return }
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				if (!isOpen) openAt(selectableIndices[0] ?? -1)
				else if (activeIndex >= 0 && items[activeIndex]) commit(items[activeIndex], activeIndex)
				return
			}
			if (isOpen && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
				e.preventDefault()
				const now = Date.now()
				const text = (now - search.current.time < 600 ? search.current.text : '') + e.key.toLowerCase()
				search.current = { text, time: now }
				const query = [...text].every((char) => char === text[0]) ? text[0] : text
				const start = selectableIndices.indexOf(activeIndex)
				const ordered = [...selectableIndices.slice(start + 1), ...selectableIndices.slice(0, start + 1)]
				const match = ordered.find((index) => (items[index].label ?? '').toLowerCase().startsWith(query))
				if (match !== undefined) setActiveIndex(match)
			}
		}

		// The panel renders in the same pass that opens it, so focus can move
		// in at once; while it fades out it is inert and drops the menu role.
		const isPanelLeaving = !isOpen && phase === 'closing'
		const isPanelRendered = isOpen || isPanelLeaving
		const panelClass = ['panel', isPanelLeaving ? 'is-closing' : '', isCommitting ? 'is-committing' : ''].join(' ')

		return (
			<host shadowDom onkeydown={onKeyDown}>
				<div class="trigger" onclick={() => isOpen ? close() : openAt(-1)}>
					<slot ref={triggerSlotRef} name="trigger" onslotchange={syncTriggerAria} />
				</div>

				{isPanelRendered && (
					<div
						class={panelClass}
						role={isOpen ? 'menu' : undefined}
						inert={isPanelLeaving}
					>
						{items.map((item, index) => {
							if (item.isSeparator) return <div key={`sep-${index}`} class="sep" role="separator" />
							const cls = ['item']
								.concat(index === activeIndex ? ['is-active'] : [])
								.concat(item.isDanger ? ['is-error'] : [])
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
									id={`menu-item-${index}`}
									tabindex={index === activeIndex ? '0' : '-1'}
									disabled={item.isDisabled}
									onmouseenter={() => !isCommitting && setActiveIndex(index)}
									onclick={() => commit(item, index)}
								>
									{item.icon && <span class="icon" innerHTML={item.icon} />}
									<span class="label">{item.slot ? <slot name={item.slot} /> : item.label}</span>
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
			align: { type: oneOf('start', 'end'), reflect: true },
			tone: { type: oneOf('neutral', 'primary', 'secondary'), reflect: true },
			isHidden: { type: Boolean, reflect: true },
			select: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles: [styles, interactionStyles]
	}
)


/*
 * z-menu-item, one declarative row for z-menu and z-context-menu. Attributes
 * mirror the `items` entries (value, label, shortcut, is-disabled, is-danger);
 * its children are the row's visible content.
 */
export const ZMenuItem = c(
	() => (
		<host shadowDom>
			<slot />
		</host>
	),
	{
		props: {
			value: { type: String, reflect: true },
			label: { type: String, reflect: true },
			shortcut: { type: String, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isDanger: { type: Boolean, reflect: true }
		},
		styles: css`
			:host {
				display: inline-flex;
				align-items: center;
				gap: 0.625rem;
				min-width: 0;
			}
		`
	}
)


/** z-menu-separator, a hairline between declarative z-menu-item groups. */
export const ZMenuSeparator = c(() => <host />, { props: {} })

