import { interactionStyles } from '../shared/interaction-styles'
import { defineFormElement, useFormControl } from '../shared/form-control'
import { describableProps, describedBy, renderDescriptions, srOnlyStyles, useAccessibleName } from '../shared/accessible'
import { c, css, event, useProp, useState, useHost, useEffect, useRef } from 'atomico'
import { themedScrollbarStyles } from '../shared/scrollbar-styles'
import { computePosition, autoUpdate, applyPosition, showFloating, hideFloating } from '../shared/overlay'
import { oneOf } from '../shared/prop-types'
import { useLocale } from '../shared/locale'

/*
 * z-select, a custom dropdown. Trigger shows the selected label (or a
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
		/* The trigger is a pressable cap, not a hole — raised, unlike z-input.
		   Inert in the flat themes. */
		background: var(--material-raised), transparent;
		box-shadow: var(--elevation-raised);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--foreground);
		font-family: inherit;
		cursor: pointer;
		text-align: start;
		user-select: none;
		-webkit-user-select: none;
		transition: border-color var(--motion-fast) var(--ease-enter), background-color var(--motion-fast) var(--ease-enter);
	}

	.trigger.is-sm {
		height: var(--control-height-sm);
		padding-inline: 0.75rem;
		font-size: var(--control-font-size-sm);
	}
	.trigger.is-md {
		height: var(--control-height-md);
		padding-inline: 0.875rem;
		font-size: var(--control-font-size-md);
	}
	.trigger.is-lg {
		height: var(--control-height-lg);
		padding-inline: 1rem;
		font-size: var(--control-font-size-lg);
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
		opacity: var(--control-disabled-opacity);
		pointer-events: none;
	}

	.trigger:focus-visible {
		outline: 3px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.value { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

	.value.is-placeholder {
		color: var(--muted-foreground);
	}

	.chevron {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--muted-foreground);
		transition: transform var(--motion-fast) var(--ease-enter);
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

	/* Fixed + top-layer (via [popover]) rather than absolute-in-:host, so the
	   panel escapes any scrollable ancestor (e.g. a dialog body) instead of
	   enlarging its scrollable overflow. The display property is left unset
	   here (outside :popover-open) so the UA's popover stylesheet still hides
	   it when closed — an author display declaration would out-cascade that
	   regardless of specificity, since origin wins first. See shared/overlay.ts. */
	.panel {
		position: fixed;
		box-sizing: border-box;
		margin: 0;
		/* physical: shared/overlay.ts positions the panel from measured rects */
		left: 0;
		top: 0;
		right: auto; /* physical */
		bottom: auto;
		z-index: 50;
		background: var(--popover);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.3125rem;
		max-height: 16rem;
		overflow-y: auto;
		gap: 1px;
	}

	.panel:popover-open {
		display: flex;
		flex-direction: column;
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
	if (props.size === 'sm') return 'is-sm'
	if (props.size === 'lg') return 'is-lg'
	return 'is-md'
}

type OptionT = { value: string; label: string; isDisabled?: boolean }

export const ZSelect = c(
	(props) => {
		const t = useLocale()
		const host = useHost()
		const accessibleName = useAccessibleName(props.label)
		const panelRef = useRef<HTMLDivElement>()
		const triggerRef = useRef<HTMLButtonElement>()
		const [value, setValue] = useProp<string>('value')
		const defaultValue = useRef(value)
		const [isOpen, setIsOpen] = useState(false)
		const [activeIndex, setActiveIndex] = useState(-1)

		const options: OptionT[] = Array.isArray(props.options) ? (props.options as OptionT[]) : []
		const selected = options.find((o) => o.value === value)
		const hasValue = value != null && value !== ''
		// The trigger is a <button>, which has no validity of its own, so
		// `required` is decided here and anchored to it for the browser's bubble.
		const { isFormDisabled } = useFormControl({
			value: value ?? '',
			isDisabled: props.isDisabled,
			control: triggerRef,
			validity: props.isRequired && !hasValue
				? { flags: { valueMissing: true }, message: t('selectAnItemInTheList') }
				: { flags: {} },
			onReset: () => setValue(defaultValue.current),
			onRestore: (state) => { if (typeof state === 'string') setValue(state) }
		})
		const isDisabled = Boolean(props.isDisabled) || isFormDisabled

		useEffect(() => {
			if (!isOpen) return
			const onDocumentPointerDown = (e: Event) => {
				if (!e.composedPath().includes(host.current as EventTarget)) setIsOpen(false)
			}
			document.addEventListener('pointerdown', onDocumentPointerDown)
			return () => document.removeEventListener('pointerdown', onDocumentPointerDown)
		}, [isOpen])

		useEffect(() => {
			const panel = panelRef.current
			if (!panel) return
			if (!isOpen) {
				hideFloating(panel)
				return
			}
			showFloating(panel)
			const update = () => {
				panel.style.width = `${host.current.getBoundingClientRect().width}px`
				applyPosition(panel, computePosition(host.current, panel, { placement: 'bottom-start', offset: 6, padding: 8 }))
			}
			const cleanup = autoUpdate(host.current, panel, update)
			return () => {
				cleanup()
				hideFloating(panel)
			}
		}, [isOpen])

		const enabledIndices = options.flatMap((option, index) => option.isDisabled ? [] : [index])
		const open = (fromEnd = false) => {
			if (isDisabled) return
			const selectedIndex = options.findIndex((option) => option.value === value && !option.isDisabled)
			setActiveIndex(selectedIndex >= 0 ? selectedIndex : (fromEnd ? enabledIndices.at(-1) : enabledIndices[0]) ?? -1)
			setIsOpen(true)
		}
		const commit = (opt: OptionT) => {
			if (isDisabled || opt.isDisabled) return
			setIsOpen(false)
			if (opt.value !== value) {
				setValue(opt.value)
				props.change({ value: opt.value })
			}
			host.current.shadowRoot?.querySelector<HTMLButtonElement>('.trigger')?.focus()
		}

		useEffect(() => {
			if (isDisabled) setIsOpen(false)
		}, [isDisabled])

		useEffect(() => {
			if (!isOpen) return
			if (!options[activeIndex] || options[activeIndex].isDisabled) {
				setActiveIndex(enabledIndices[0] ?? -1)
				return
			}
			panelRef.current?.querySelector<HTMLElement>(`#option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
		}, [isOpen, activeIndex, props.options])

		const search = useRef({ text: '', time: 0 })
		const onKeyDown = (e: KeyboardEvent) => {
			if (isDisabled) return
			if (e.key === 'Tab' || e.key === 'Escape') {
				if (e.key === 'Escape' && isOpen) { e.preventDefault(); e.stopPropagation() }
				setIsOpen(false)
				return
			}
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault()
				if (!isOpen) open()
				else if (activeIndex >= 0 && options[activeIndex]) commit(options[activeIndex])
				return
			}
			if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
				e.preventDefault()
				if (!isOpen) { open(e.key === 'ArrowUp' || e.key === 'End'); return }
				const position = enabledIndices.indexOf(activeIndex)
				const next = e.key === 'Home' ? enabledIndices[0]
					: e.key === 'End' ? enabledIndices.at(-1)
					: enabledIndices[(position + (e.key === 'ArrowDown' ? 1 : -1) + enabledIndices.length) % enabledIndices.length]
				setActiveIndex(next ?? -1)
				return
			}
			if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
				e.preventDefault()
				const now = Date.now()
				const text = (now - search.current.time < 600 ? search.current.text : '') + e.key.toLowerCase()
				search.current = { text, time: now }
				const query = [...text].every((char) => char === text[0]) ? text[0] : text
				const start = enabledIndices.indexOf(activeIndex)
				const ordered = [...enabledIndices.slice(start + 1), ...enabledIndices.slice(0, start + 1)]
				const match = ordered.find((index) => options[index].label.toLowerCase().startsWith(query))
				if (match !== undefined) { setIsOpen(true); setActiveIndex(match) }
			}
		}

		const triggerClass = ['trigger', resolveSizeClass(props)]
			.concat(isOpen ? ['is-open'] : [])
			.concat(props.isInvalid ? ['is-invalid'] : [])
			.concat(isDisabled ? ['is-disabled'] : [])
			.join(' ')

		return (
			<host shadowDom={{ delegatesFocus: true }}>
				<button
					ref={triggerRef}
					type="button"
					class={triggerClass}
					disabled={isDisabled}
					role="combobox"
					aria-required={props.isRequired ? 'true' : undefined}
					aria-haspopup="listbox"
					aria-controls="select-options"
					aria-activedescendant={isOpen && activeIndex >= 0 ? `option-${activeIndex}` : undefined}
					aria-label={accessibleName}
					aria-describedby={describedBy(props.description, props.error)}
					aria-invalid={props.isInvalid || props.error ? 'true' : undefined}
					aria-expanded={isOpen ? 'true' : 'false'}
					onclick={() => isOpen ? setIsOpen(false) : open()}
					onkeydown={onKeyDown}
				>
					<span class={selected ? 'value' : 'value is-placeholder'}>
						{selected ? selected.label : props.placeholder || t('selectPlaceholder')}
					</span>
					<svg class="chevron" viewBox="0 0 24 24">
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>

				<div ref={panelRef} id="select-options" class="panel" role="listbox" aria-label={props.label || props.placeholder || t('options')} popover="manual">
					{options.length === 0 && <div class="empty">{t('noOptions')}</div>}
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
								id={`option-${index}`}
								aria-disabled={opt.isDisabled ? 'true' : undefined}
								aria-selected={opt.value === value ? 'true' : 'false'}
								onmouseenter={() => !opt.isDisabled && setActiveIndex(index)}
								onmousedown={(e: MouseEvent) => e.preventDefault()}
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
				{renderDescriptions(props.description, props.error)}
			</host>
		)
	},
	{
		props: {
			...describableProps,
			value: { type: String, reflect: true },
			name: { type: String, reflect: true },
			label: String,
			placeholder: String,
			options: { type: Array },
			size: { type: oneOf('sm', 'md', 'lg'), reflect: true },
			tone: { type: oneOf('neutral', 'primary', 'secondary'), reflect: true },
			isRequired: { type: Boolean, reflect: true },
			isInvalid: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isInline: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles: [themedScrollbarStyles, styles, interactionStyles, srOnlyStyles],
		form: true
	}
)

defineFormElement('z-select', ZSelect)
