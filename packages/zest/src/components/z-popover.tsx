import { c, css, event, useRef, useState, useEffect, useHost } from 'atomico'
import { floatingSurfaceStyles } from '../shared/overlay-styles'
import {
	computePosition,
	autoUpdate,
	applyPosition,
	showFloating,
	hideFloating,
	overlayPositionProps,
	type Placement
} from '../shared/overlay'

/*
 * z-popover — a click-triggered floating panel for rich content. The trigger
 * goes in [slot="trigger"]; the panel body is the default slot:
 *   <z-popover><z-button slot="trigger">Open</z-button><div>…</div></z-popover>
 * Uses the shared overlay core (a top-layer [popover=manual] surface positioned
 * by shared/overlay.ts). Dismiss is handled here — outside-click + Esc — mirroring
 * z-select / z-menu so behavior stays uniform. Fires `toggle` with { open }.
 */
const styles = css`
	.trigger {
		display: inline-flex;
	}

	.surface {
		max-width: var(--z-overlay-max-width, 22rem);
		min-width: 12rem;
		pointer-events: auto;
	}
`

export const ZPopover = c(
	(props) => {
		const host = useHost()
		const floatRef = useRef<HTMLDivElement>()
		const [isOpen, setIsOpen] = useState(false)

		const setOpen = (next: boolean) => {
			setIsOpen(next)
			props.toggle({ open: next })
		}

		useEffect(() => {
			const floating = floatRef.current
			if (!floating || !isOpen) {
				if (floating) hideFloating(floating)
				return
			}
			showFloating(floating)
			const update = () =>
				applyPosition(
					floating,
					computePosition(host.current, floating, {
						placement: (props.placement as Placement) || 'bottom',
						offset: props.offset ?? 8
					})
				)
			const cleanup = autoUpdate(host.current, floating, update)

			const onDocumentPointerDown = (e: Event) => {
				if (!e.composedPath().includes(host.current as EventTarget)) setOpen(false)
			}
			const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
			document.addEventListener('pointerdown', onDocumentPointerDown)
			document.addEventListener('keydown', onKey)

			return () => {
				cleanup()
				document.removeEventListener('pointerdown', onDocumentPointerDown)
				document.removeEventListener('keydown', onKey)
				hideFloating(floating)
			}
		}, [isOpen, props.placement, props.offset])

		return (
			<host shadowDom>
				<div
					class="trigger"
					aria-haspopup="dialog"
					aria-expanded={isOpen ? 'true' : 'false'}
					onclick={() => !props.isDisabled && setOpen(!isOpen)}
				>
					<slot name="trigger" />
				</div>
				<div ref={floatRef} class="surface" popover="manual" role="dialog">
					<slot />
				</div>
			</host>
		)
	},
	{
		props: {
			...overlayPositionProps,
			isDisabled: { type: Boolean, reflect: true },
			toggle: event<{ open: boolean }>({ bubbles: true, composed: true })
		},
		styles: [floatingSurfaceStyles, styles]
	}
)

customElements.define('z-popover', ZPopover)
