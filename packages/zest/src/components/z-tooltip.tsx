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
 * z-tooltip — a hover/focus label anchored to its slotted trigger. Wrap any
 * element: <z-tooltip content="Save"><z-button>…</z-button></z-tooltip>.
 * Built on the shared overlay core: a [popover=manual] surface positioned by
 * shared/overlay.ts, so it escapes overflow/stacking and flips near edges.
 * Opens after `open-delay` ms on pointerenter/focusin; closes on leave/blur or
 * Esc. Reuses the floating-surface chrome, just tighter.
 */
const styles = css`
	.surface {
		padding: 0.375rem 0.625rem;
		max-width: 16rem;
		font-size: var(--font-size-caption);
		pointer-events: none;
		width: max-content;
		user-select: none;
		-webkit-user-select: none;
		background: var(--color-neutral-4);
		border: 1px solid var(--color-neutral-6);
	}
`

export const ZTooltip = c(
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
						placement: (props.placement as Placement) || 'top',
						offset: props.offset ?? 8
					})
				)
			const cleanup = autoUpdate(host.current, floating, update)
			return () => {
				cleanup()
				hideFloating(floating)
			}
		}, [isOpen, props.placement, props.offset])

		const open = () => {
			if (props.isDisabled || !props.content) return
			clearTimeout(timer.current)
			timer.current = setTimeout(() => setIsOpen(true), props.openDelay ?? 150)
		}
		const close = () => {
			clearTimeout(timer.current)
			setIsOpen(false)
		}

		return (
			<host
				shadowDom
				onpointerenter={open}
				onpointerleave={close}
				onfocusin={open}
				onfocusout={close}
				onkeydown={(e: KeyboardEvent) => e.key === 'Escape' && close()}
			>
				<slot />
				<div ref={floatRef} class='surface' popover='manual' role='tooltip'>
					{props.content}
				</div>
			</host>
		)
	},
	{
		props: {
			...overlayPositionProps,
			content: String,
			openDelay: { type: Number },
			isDisabled: { type: Boolean, reflect: true }
		},
		styles: [floatingSurfaceStyles, styles]
	}
)

customElements.define('z-tooltip', ZTooltip)
