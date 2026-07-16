import { c, css, useRef, useState, useEffect, useHost } from 'atomico'
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
 * z-hover-card — a hover-triggered preview panel (think a profile peek on a
 * @mention). Trigger in [slot="trigger"], rich body in the default slot. Like
 * z-popover it rides the shared overlay core, but opens on hover/focus after
 * `open-delay` and closes after `close-delay`, with a grace period so the
 * pointer can travel from the trigger into the card without it vanishing.
 */
const styles = css`
	.trigger {
		display: inline-flex;
	}

	.surface {
		max-width: var(--z-overlay-max-width, 20rem);
		min-width: 14rem;
		pointer-events: auto;
	}
`

export const ZHoverCard = c(
	(props) => {
		const host = useHost()
		const floatRef = useRef<HTMLDivElement>()
		const timer = useRef<ReturnType<typeof setTimeout>>()
		const [isOpen, setIsOpen] = useState(false)

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
				const path = e.composedPath()
				if (!path.includes(host.current as EventTarget) && !path.includes(floating)) setIsOpen(false)
			}
			const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false)
			document.addEventListener('pointerdown', onDocumentPointerDown)
			document.addEventListener('keydown', onKey)
			return () => {
				cleanup()
				document.removeEventListener('pointerdown', onDocumentPointerDown)
				document.removeEventListener('keydown', onKey)
				hideFloating(floating)
			}
		}, [isOpen, props.placement, props.offset])

		const open = () => {
			clearTimeout(timer.current)
			timer.current = setTimeout(() => setIsOpen(true), props.openDelay ?? 200)
		}
		const scheduleClose = () => {
			clearTimeout(timer.current)
			timer.current = setTimeout(() => setIsOpen(false), props.closeDelay ?? 150)
		}

		return (
			<host shadowDom>
				<div
					class="trigger"
					onpointerenter={open}
					onpointerleave={scheduleClose}
					onfocusin={open}
					onfocusout={scheduleClose}
				>
					<slot name="trigger" />
				</div>
				<div
					ref={floatRef}
					class="surface"
					popover="manual"
					role="dialog"
					onpointerenter={open}
					onpointerleave={scheduleClose}
				>
					<slot />
				</div>
			</host>
		)
	},
	{
		props: {
			...overlayPositionProps,
			openDelay: { type: Number },
			closeDelay: { type: Number }
		},
		styles: [floatingSurfaceStyles, styles]
	}
)

customElements.define('z-hover-card', ZHoverCard)
