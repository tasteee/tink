import { c, css, event, useHost, useState, useEffect } from 'atomico'
import { floatingIconButtonStyles } from '../shared/editor-overlay-styles'
import { createMenuKeyDownHandler } from '../shared/menu-nav'

/*
 * z-format-toolbar — a sticky formatting bar meant to sit at the top of an
 * editor, always visible (unlike z-selection-toolbar/z-bubble-menu, which
 * float over a selection). Button states come from an `items` array your
 * selectionchange handler refreshes constantly:
 *   toolbar.items = [{ value: 'bold', icon, isActive: true }, ...]
 * Rapid-fire updates (every caret move) are coalesced with
 * requestAnimationFrame so the toolbar re-renders at most once per frame
 * rather than once per event. The heading-level control is a custom listbox
 * (not a native <select>, per spec) built on the same trap as z-menu. Fires
 * `action` with { value } for buttons, `headingchange` with { value } for
 * the heading picker.
 */
const styles = css`
	:host {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		box-sizing: border-box;
		width: 100%;
		padding: 0.375rem 0.5rem;
		background: var(--popover);
		border-bottom: 1px solid var(--border);
		position: sticky;
		top: 0;
		z-index: var(--z-toolbar, 40);
	}

	.sep {
		width: 1px;
		align-self: stretch;
		margin: 0.25rem 0.125rem;
		background: var(--border);
	}

	.heading {
		position: relative;
	}

	.heading-trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		height: 1.75rem;
		padding: 0 0.5rem;
		background: transparent;
		border: 0;
		border-radius: var(--radius-sm);
		color: var(--foreground);
		font-family: inherit;
		font-size: var(--font-size-small);
		cursor: pointer;
		transition: background-color 0.12s ease;
	}

	.heading-trigger:hover {
		background: color-mix(in oklch, var(--foreground) 8%, transparent);
	}

	.heading-trigger svg {
		width: 0.875rem;
		height: 0.875rem;
		color: var(--muted-foreground);
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		fill: none;
	}

	.heading-panel {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		z-index: var(--z-menu, 50);
		min-width: 9rem;
		background: var(--popover);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.3125rem;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.heading-option {
		display: flex;
		align-items: center;
		padding: 0.4375rem 0.625rem;
		border-radius: var(--radius-sm);
		font-size: var(--font-size-small);
		color: var(--foreground);
		cursor: pointer;
		background: transparent;
		border: 0;
		font-family: inherit;
		text-align: left;
		width: 100%;
		box-sizing: border-box;
	}

	.heading-option.is-active {
		background: color-mix(in oklch, var(--purple) 14%, transparent);
		color: var(--purple);
	}

	.heading-option.is-selected {
		font-weight: 600;
	}
`

type FormatItemT = {
	value?: string
	label?: string
	icon?: string
	isActive?: boolean
	isDisabled?: boolean
}

type HeadingOptionT = { value: string; label: string }

export const ZFormatToolbar = c(
	(props) => {
		const host = useHost()
		const [renderedItems, setRenderedItems] = useState<FormatItemT[]>(Array.isArray(props.items) ? (props.items as FormatItemT[]) : [])
		const [isHeadingOpen, setIsHeadingOpen] = useState(false)
		const [headingActiveIndex, setHeadingActiveIndex] = useState(0)

		useEffect(() => {
			const nextItems = Array.isArray(props.items) ? (props.items as FormatItemT[]) : []
			const raf = requestAnimationFrame(() => setRenderedItems(nextItems))
			return () => cancelAnimationFrame(raf)
		}, [props.items])

		useEffect(() => {
			if (!isHeadingOpen) return
			const onDocumentPointerDown = (documentEvent: Event) => {
				if (!documentEvent.composedPath().includes(host.current as EventTarget)) setIsHeadingOpen(false)
			}
			document.addEventListener('pointerdown', onDocumentPointerDown)
			return () => document.removeEventListener('pointerdown', onDocumentPointerDown)
		}, [isHeadingOpen])

		const headingOptions: HeadingOptionT[] = Array.isArray(props.headingOptions) ? (props.headingOptions as HeadingOptionT[]) : []
		const currentHeading = headingOptions.find((option) => option.value === props.headingValue)

		const commitHeading = (option: HeadingOptionT) => {
			setIsHeadingOpen(false)
			props.headingchange({ value: option.value })
		}

		const onHeadingKeyDown = createMenuKeyDownHandler({
			isOpen: isHeadingOpen,
			itemCount: headingOptions.length,
			activeIndex: headingActiveIndex,
			isSelectable: () => true,
			onOpen: () => setIsHeadingOpen(true),
			onMove: setHeadingActiveIndex,
			onCommit: (index) => commitHeading(headingOptions[index]),
			onClose: () => setIsHeadingOpen(false)
		})

		return (
			<host shadowDom role="toolbar" aria-label={props.label || 'Formatting'}>
				<div class="heading" onkeydown={onHeadingKeyDown}>
					<button
						type="button"
						class="heading-trigger"
						aria-haspopup="listbox"
						aria-expanded={isHeadingOpen ? 'true' : 'false'}
						onclick={() => setIsHeadingOpen(!isHeadingOpen)}
					>
						<span>{currentHeading?.label || props.headingPlaceholder || 'Paragraph'}</span>
						<svg viewBox="0 0 24 24">
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</button>
					{isHeadingOpen && (
						<div class="heading-panel" role="listbox" aria-label="Heading level">
							{headingOptions.map((option, index) => {
								const optionClass = ['heading-option']
									.concat(index === headingActiveIndex ? ['is-active'] : [])
									.concat(option.value === props.headingValue ? ['is-selected'] : [])
									.join(' ')
								return (
									<button
										key={option.value}
										type="button"
										class={optionClass}
										role="option"
										aria-selected={option.value === props.headingValue ? 'true' : 'false'}
										onmouseenter={() => setHeadingActiveIndex(index)}
										onclick={() => commitHeading(option)}
									>
										{option.label}
									</button>
								)
							})}
						</div>
					)}
				</div>

				<div class="sep" role="separator" />

				{renderedItems.map((item, index) => {
					const buttonClass = ['icon-button'].concat(item.isActive ? ['is-active'] : []).join(' ')
					return (
						<button
							key={item.value || index}
							type="button"
							class={buttonClass}
							aria-label={item.label || item.value}
							aria-pressed={item.isActive ? 'true' : 'false'}
							disabled={item.isDisabled}
							onclick={() => props.action({ value: item.value || item.label || '' })}
						>
							{item.icon ? <span innerHTML={item.icon} /> : item.label}
						</button>
					)
				})}
			</host>
		)
	},
	{
		props: {
			items: { type: Array },
			headingOptions: { type: Array },
			headingValue: { type: String, reflect: true },
			headingPlaceholder: String,
			label: String,
			action: event<{ value: string }>({ bubbles: true, composed: true }),
			headingchange: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles: [floatingIconButtonStyles, styles]
	}
)

customElements.define('z-format-toolbar', ZFormatToolbar)
