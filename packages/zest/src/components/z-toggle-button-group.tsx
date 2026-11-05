import { interactionStyles } from '../shared/interaction-styles'
import { defineFormElement, useFormControl } from '../shared/form-control'
import { c, css, event, useHost, useListener, useRef, useState } from 'atomico'
import { toggleVariantProps } from '../shared/toggle-schema'
import { oneOf } from '../shared/prop-types'

const styles = css`
	:host {
		display: flex;
		width: fit-content;
		align-items: center;
		user-select: none;
		-webkit-user-select: none;
	}

	/* align-items: center on the base :host cross-aligns by height in
	   horizontal mode, which is fine since every item shares one height. In
	   vertical mode the cross axis becomes width, and centering there lets
	   each item sit at its own fit-content width — shorter labels end up
	   narrower than longer ones, staircasing instead of stacking flush. */
	:host([direction='vertical']) {
		flex-direction: column;
		align-items: stretch;
	}

	::slotted(*) {
		--z-toggle-button-radius: 0;
		flex-shrink: 0;
		min-width: 0;
	}

	::slotted(:only-child) {
		--z-toggle-button-radius: var(--radius-md);
	}

	:host(:not([direction='vertical'])) ::slotted(:first-child) {
		--z-toggle-button-radius: var(--radius-md) 0 0 var(--radius-md);
	}

	:host(:not([direction='vertical'])) ::slotted(:last-child) {
		--z-toggle-button-radius: 0 var(--radius-md) var(--radius-md) 0;
	}

	:host(:not([direction='vertical'])) ::slotted(:not(:first-child)) {
		margin-inline-start: -1px;
	}

	:host([direction='vertical']) ::slotted(:first-child) {
		--z-toggle-button-radius: var(--radius-md) var(--radius-md) 0 0;
	}

	:host([direction='vertical']) ::slotted(:last-child) {
		--z-toggle-button-radius: 0 0 var(--radius-md) var(--radius-md);
	}

	:host([direction='vertical']) ::slotted(:not(:first-child)) {
		margin-top: -1px;
	}

	/* Stacking ladder: items overlap by 1px (above) so neighbouring borders
	   collapse into a single seam. Earlier items are laid ABOVE later ones so
	   each item paints its OWN right/bottom border at the seam rather than being
	   covered by the next item's leading border. The hovered/focused/selected
	   item jumps above everything so its full (tone) border is never clipped. */
	::slotted(*) {
		position: relative;
		z-index: 1;
	}
	::slotted(:nth-child(1)) {
		z-index: 9;
	}
	::slotted(:nth-child(2)) {
		z-index: 8;
	}
	::slotted(:nth-child(3)) {
		z-index: 7;
	}
	::slotted(:nth-child(4)) {
		z-index: 6;
	}
	::slotted(:nth-child(5)) {
		z-index: 5;
	}
	::slotted(:nth-child(6)) {
		z-index: 4;
	}
	::slotted(:nth-child(7)) {
		z-index: 3;
	}
	::slotted(:nth-child(8)) {
		z-index: 2;
	}
	::slotted(:hover),
	::slotted([data-state='on']),
	::slotted(:focus-visible) {
		z-index: 20;
	}

	/* Group-level variants work by inheritance: these custom properties cross
	   into the slotted items and their shadow buttons, and an item that sets
	   its own accent/size/kind overrides them locally. That only holds because
	   an unset variant resolves to no class at all — see toggle-schema.ts. */
	:host([tone='primary']) {
		--z-toggle-button-color: var(--neon-purple);
		--z-toggle-button-accent: var(--neon-purple);
		--z-toggle-button-accent-foreground: var(--on-accent);
	}

	:host([tone='secondary']) {
		--z-toggle-button-color: var(--neon-pink);
		--z-toggle-button-accent: var(--neon-pink);
		--z-toggle-button-accent-foreground: var(--on-accent);
	}

	:host([tone='neutral']) {
		--z-toggle-button-color: var(--foreground);
		--z-toggle-button-accent: var(--primary);
		--z-toggle-button-accent-foreground: var(--primary-foreground);
	}

	:host([tone='success']) {
		--z-toggle-button-color: var(--success);
		--z-toggle-button-accent: var(--success);
		--z-toggle-button-accent-foreground: var(--on-accent);
	}

	:host([tone='warning']) {
		--z-toggle-button-color: var(--warning);
		--z-toggle-button-accent: var(--warning);
		--z-toggle-button-accent-foreground: var(--on-accent);
	}

	:host([tone='danger']) {
		--z-toggle-button-color: var(--destructive);
		--z-toggle-button-accent: var(--destructive);
		--z-toggle-button-accent-foreground: var(--on-accent);
	}


	:host([size='xs']) {
		--z-toggle-button-height: 1.75rem;
		--z-toggle-button-padding-inline: 0.625rem;
		--z-toggle-button-min-width: 1.75rem;
		--z-toggle-button-font-size: 0.75rem;
		--z-toggle-button-icon-size: 0.75rem;
	}

	:host([size='sm']) {
		--z-toggle-button-height: var(--control-height-sm);
		--z-toggle-button-padding-inline: 0.75rem;
		--z-toggle-button-min-width: var(--control-height-sm);
		--z-toggle-button-font-size: 0.8125rem;
		--z-toggle-button-icon-size: 0.875rem;
	}

	:host([size='lg']) {
		--z-toggle-button-height: var(--control-height-lg);
		--z-toggle-button-padding-inline: 1.25rem;
		--z-toggle-button-min-width: var(--control-height-lg);
		--z-toggle-button-font-size: 1rem;
		--z-toggle-button-icon-size: 1.125rem;
	}

	:host([kind='ghost']) {
		--z-toggle-button-border: transparent;
		--z-toggle-button-hover-bg: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 10%, transparent);
		--z-toggle-button-on-bg: var(--z-toggle-button-accent, var(--primary));
		--z-toggle-button-on-color: var(--z-toggle-button-accent-foreground, var(--primary-foreground));
		--z-toggle-button-on-border: transparent;
	}

	/* off: tone-colored text + a dimmed tone border (mixed toward transparent so
	   the hue never rotates). on: solid tone fill with dark on-foreground text. */
	:host([kind='outline']) {
		--z-toggle-button-border: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 50%, transparent);
		--z-toggle-button-hover-bg: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 10%, transparent);
		--z-toggle-button-on-bg: var(--z-toggle-button-accent, var(--primary));
		--z-toggle-button-on-color: var(--z-toggle-button-accent-foreground, var(--primary-foreground));
		--z-toggle-button-on-border: var(--z-toggle-button-accent, var(--primary));
	}

	/* solid: filled at rest, not just on press, so the segment reads as an
	   object even before it is selected. */
	:host([kind='solid']) {
		--z-toggle-button-border: transparent;
		--z-toggle-button-bg: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 12%, var(--surface, transparent));
		--z-toggle-button-hover-bg: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 20%, var(--surface, transparent));
		--z-toggle-button-on-bg: var(--z-toggle-button-accent, var(--primary));
		--z-toggle-button-on-color: var(--z-toggle-button-accent-foreground, var(--primary-foreground));
		--z-toggle-button-on-border: transparent;
	}

	:host([kind='soft']) {
		--z-toggle-button-border: transparent;
		--z-toggle-button-bg: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 15%, transparent);
		--z-toggle-button-color: var(--z-toggle-button-accent, var(--foreground));
		--z-toggle-button-hover-bg: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 24%, transparent);
		--z-toggle-button-on-bg: var(--z-toggle-button-accent, var(--primary));
		--z-toggle-button-on-color: var(--z-toggle-button-accent-foreground, var(--primary-foreground));
		--z-toggle-button-on-border: transparent;
	}

	/* plain: text only at rest, underline is the only affordance until pressed. */
	:host([kind='plain']) {
		--z-toggle-button-border: transparent;
		--z-toggle-button-hover-bg: transparent;
		--z-toggle-button-on-bg: var(--z-toggle-button-accent, var(--primary));
		--z-toggle-button-on-color: var(--z-toggle-button-accent-foreground, var(--primary-foreground));
		--z-toggle-button-on-border: transparent;
	}

	:host([is-hidden]) {
		display: none;
	}
`

type PressDetailT = { pressed: boolean; value?: string }
type ToggleGroupItemElementT = HTMLElement & { isPressed?: boolean }

export const ZToggleButtonGroup = c(
	(props) => {
		const host = useHost()
		// The pressed values live on the children; a copy in state is what the
		// form reads, refreshed on every press and slot change.
		const [pressed, setPressed] = useState<string[]>([])
		const defaults = useRef<string[] | null>(null)
		const syncPressed = () => {
			const values = getPressedValues(host.current)
			if (defaults.current === null && host.current.querySelector('z-toggle-button-group-item')) defaults.current = values
			setPressed(values)
		}
		const formValue = () => {
			if (pressed.length === 0) return null
			if (!props.isMultiple) return pressed[0]
			const data = new FormData()
			const name = host.current.getAttribute('name') ?? ''
			for (const value of pressed) data.append(name, value)
			return data
		}
		const { isFormDisabled } = useFormControl({
			value: formValue(),
			isDisabled: props.isDisabled,
			onReset: () => {
				const wanted = new Set(defaults.current ?? [])
				for (const item of host.current.querySelectorAll<ToggleGroupItemElementT & { value?: string }>('z-toggle-button-group-item')) {
					item.isPressed = wanted.has(item.value ?? '')
				}
				syncPressed()
			}
		})
		const isDisabled = Boolean(props.isDisabled) || isFormDisabled

		useListener(
			host,
			'press',
			(rawEvent: unknown) => {
				const zEvent = rawEvent as CustomEvent<PressDetailT>

				if (props.isMultiple) {
					props.change({ value: getPressedValues(host.current) })
					syncPressed()
					return
				}

				const target = zEvent.target as ToggleGroupItemElementT

				for (const item of host.current.querySelectorAll<ToggleGroupItemElementT>('z-toggle-button-group-item')) {
					if (item !== target) item.isPressed = false
				}

				props.change({ value: zEvent.detail.pressed ? zEvent.detail.value : undefined })
				syncPressed()
			},
			{ passive: true }
		)

		return (
			<host shadowDom role="group" aria-disabled={isDisabled ? 'true' : undefined}>
				<slot onslotchange={syncPressed} />
			</host>
		)
	},
	{
		props: {
			...toggleVariantProps,
			name: { type: String, reflect: true },
			direction: { type: oneOf('horizontal', 'vertical'), reflect: true },
			isHidden: { type: Boolean, reflect: true },
			isMultiple: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			change: event<{ value?: string | string[] }>({ bubbles: true, composed: true })
		},
		styles: [styles, interactionStyles],
		form: true
	}
)

const getPressedValues = (root: HTMLElement): string[] => {
	const items = root.querySelectorAll<ToggleGroupItemElementT & { value?: string }>('z-toggle-button-group-item')
	const pressedValues: string[] = []

	for (const item of items) {
		if (item.isPressed && item.value) pressedValues.push(item.value)
	}

	return pressedValues
}

defineFormElement('z-toggle-button-group', ZToggleButtonGroup)
