import { computePosition, autoUpdate, applyPosition, showFloating, hideFloating } from '../shared/overlay'
import { interactionStyles } from '../shared/interaction-styles'
import { defineFormElement, useFormControl } from '../shared/form-control'
import { describableProps, describedBy, renderDescriptions, srOnlyStyles, useAccessibleName } from '../shared/accessible'
import { c, css, event, useProp, useState, useHost, useEffect, useRef } from 'atomico'
import { themedScrollbarStyles } from '../shared/scrollbar-styles'
import { oneOf } from '../shared/prop-types'
import { useLocale } from '../shared/locale'

/*
 * z-combobox, a select you can type into. The trigger is a text input that
 * filters the option list as you type; matches highlight, Enter commits the
 * active row. Same shadow-free bordered popover as z-select. Options come from
 * an `options` array property: el.options = [{ value, label, isDisabled? }].
 */
const styles = css`
	.field:focus-within { outline: 2px solid var(--focus-ring); outline-offset: 2px; }

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
		transition: border-color var(--motion-fast) var(--ease-enter), background-color var(--motion-fast) var(--ease-enter);
	}

	/* matches z-input's scale — a combobox is a text field first, and the two
	   sit side by side in forms often enough that they must share a baseline. */
	.field.is-sm {
		height: var(--control-height-sm);
		padding-inline: 0.75rem;
	}
	.field.is-md {
		height: var(--control-height-md);
		padding-inline: 0.875rem;
	}
	.field.is-lg {
		height: var(--control-height-lg);
		padding-inline: 1rem;
	}

	.field.is-sm input {
		font-size: var(--control-font-size-sm);
	}
	.field.is-lg input {
		font-size: var(--control-font-size-lg);
	}

	.field:hover {
		border-color: color-mix(in oklch, var(--foreground) 30%, transparent);
	}

	.field.is-open {
		border-color: var(--accent);
		background: color-mix(in oklch, var(--accent) 5%, transparent);
	}

	.field.is-invalid {
		border-color: var(--destructive);
	}

	.field.is-disabled {
		opacity: var(--control-disabled-opacity);
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
		font-size: inherit;
	}

	input::placeholder {
		color: var(--muted-foreground);
		user-select: none;
		-webkit-user-select: none;
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
		cursor: pointer;
	}

	.field.is-open .chevron {
		transform: rotate(180deg);
		color: var(--accent);
	}

	.panel {
		position: fixed;
		margin: 0;
		box-sizing: border-box;
		/* physical: shared/overlay.ts positions the panel from measured rects */
		top: 0;
		left: 0; /* physical */
		right: auto; /* physical */
		bottom: auto;
		z-index: 50;
		background: var(--popover);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.3125rem;
		max-height: 16rem;
		overflow-y: auto;
	}

	.panel:popover-open {
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

const resolveSizeClass = (props: any): string => {
	if (props.size === 'sm') return 'is-sm'
	if (props.size === 'lg') return 'is-lg'
	return 'is-md'
}

export const ZCombobox = c(
	(props) => {
		const t = useLocale()
		const host = useHost()
		const accessibleName = useAccessibleName(props.label)
		const inputRef = useRef<HTMLInputElement>()
		const panelRef = useRef<HTMLDivElement>()
		const [value, setValue] = useProp<string>('value')
		const defaultValue = useRef(value)
		const [isOpen, setIsOpen] = useState(false)
		const [query, setQuery] = useState('')
		const [activeIndex, setActiveIndex] = useState(-1)

		const options: OptionT[] = Array.isArray(props.options) ? (props.options as OptionT[]) : []
		const selected = options.find((o) => o.value === value)
		const hasValue = value != null && value !== ''
		// The inner input holds the search text, not the selection, so its
		// native validity is not what the form should see; `required` is decided
		// here against the chosen option.
		const { isFormDisabled } = useFormControl({
			value: value ?? '',
			isDisabled: props.isDisabled,
			control: inputRef,
			validity: props.isRequired && !hasValue
				? { flags: { valueMissing: true }, message: t('selectAnItemInTheList') }
				: { flags: {} },
			onReset: () => { setValue(defaultValue.current); setQuery('') },
			onRestore: (state) => { if (typeof state === 'string') setValue(state) }
		})
		const isDisabled = Boolean(props.isDisabled) || isFormDisabled

		const filtered = query ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : options

		useEffect(() => {
			if (!isOpen) return
			const onDocumentPointerDown = (e: Event) => {
				if (!e.composedPath().includes(host.current as EventTarget)) {
					setIsOpen(false)
					setQuery('')
				}
			}
			document.addEventListener('pointerdown', onDocumentPointerDown)
			return () => document.removeEventListener('pointerdown', onDocumentPointerDown)
		}, [isOpen])

		useEffect(() => {
			const panel = panelRef.current
			if (!panel) return
			if (!isOpen) { hideFloating(panel); return }
			showFloating(panel)
			const cleanup = autoUpdate(host.current, panel, () => {
				panel.style.width = `${host.current.getBoundingClientRect().width}px`
				applyPosition(panel, computePosition(host.current, panel, { placement: 'bottom-start', offset: 6, padding: 8 }))
			})
			return () => { cleanup(); hideFloating(panel) }
		}, [isOpen, query])

		const commit = (opt: OptionT) => {
			if (isDisabled || opt.isDisabled) return
			if (opt.value !== value) { setValue(opt.value); props.change({ value: opt.value }) }
			setIsOpen(false)
			setQuery('')
		}

		const enabled = filtered.flatMap((option, index) => option.isDisabled ? [] : [index])
		useEffect(() => {
			if (isDisabled) { setIsOpen(false); setQuery('') }
		}, [isDisabled])
		useEffect(() => {
			if (!isOpen) return
			if (!filtered[activeIndex] || filtered[activeIndex].isDisabled) setActiveIndex(enabled[0] ?? -1)
			else host.current.shadowRoot?.querySelector<HTMLElement>(`#option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
		}, [isOpen, activeIndex, query, props.options])
		const onKeyDown = (e: KeyboardEvent) => {
			if (isDisabled) return
			if (e.key === 'Escape' || e.key === 'Tab') {
				if (e.key === 'Escape' && isOpen) { e.preventDefault(); e.stopPropagation() }
				setIsOpen(false)
				setQuery('')
				return
			}
			if (e.key === 'Enter' && isOpen) {
				e.preventDefault()
				if (filtered[activeIndex]) commit(filtered[activeIndex])
				return
			}
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault()
				if (!isOpen) { setIsOpen(true); setActiveIndex((e.key === 'ArrowUp' ? enabled.at(-1) : enabled[0]) ?? -1); return }
				const position = enabled.indexOf(activeIndex)
				setActiveIndex(enabled[(position + (e.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length] ?? -1)
			}
		}

		const fieldClass = ['field', resolveSizeClass(props)]
			.concat(isOpen ? ['is-open'] : [])
			.concat(props.isInvalid ? ['is-invalid'] : [])
			.concat(isDisabled ? ['is-disabled'] : [])
			.join(' ')

		const displayValue = isOpen ? query : selected ? selected.label : ''

		return (
			<host shadowDom={{ delegatesFocus: true }}>
				<div class={fieldClass}>
					<input
						ref={inputRef}
						type="text"
						value={displayValue}
						placeholder={props.placeholder || t('searchPlaceholder')}
						disabled={isDisabled}
						role="combobox"
						aria-required={props.isRequired ? 'true' : undefined}
						aria-label={accessibleName}
						aria-describedby={describedBy(props.description, props.error)}
						aria-invalid={props.isInvalid || props.error ? 'true' : undefined}
						aria-expanded={isOpen ? 'true' : 'false'}
						aria-autocomplete="list"
						aria-controls="combobox-options"
						aria-activedescendant={isOpen && activeIndex >= 0 ? `option-${activeIndex}` : undefined}
						onblur={() => { setIsOpen(false); setQuery('') }}
						onfocus={() => { if (!isDisabled) { setIsOpen(true); setActiveIndex(enabled[0] ?? -1) } }}
						oninput={(e: any) => {
							setQuery(e.target.value)
							setActiveIndex(-1)
							setIsOpen(true)
						}}
						onkeydown={onKeyDown}
					/>
					<svg
						class="chevron"
						viewBox="0 0 24 24"
						onmousedown={(e: MouseEvent) => e.preventDefault()}
						onclick={() => {
							if (isDisabled) return
							setIsOpen(!isOpen)
							inputRef.current?.focus()
						}}
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</div>

				<div ref={panelRef} popover="manual" id="combobox-options" class="panel" role="listbox" aria-label={props.label || t('options')}>
						{filtered.length === 0 && <div class="empty">{t('noMatches')}</div>}
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
									id={`option-${index}`}
									aria-disabled={opt.isDisabled ? 'true' : undefined}
									aria-selected={opt.value === value ? 'true' : 'false'}
									onmouseenter={() => !opt.isDisabled && setActiveIndex(index)}
									onmousedown={(e: MouseEvent) => e.preventDefault()}
									onclick={() => commit(opt)}
								>
									{opt.label}
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
			tone: { type: oneOf('primary', 'secondary'), reflect: true },
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

defineFormElement('z-combobox', ZCombobox)
