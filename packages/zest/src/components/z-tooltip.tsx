import { interactionStyles } from '../shared/interaction-styles'
import { defineElement } from '../shared/define-element'
import { c, css, useRef, useState, useEffect, useHost } from 'atomico'
import { floatingSurfaceStyles } from '../shared/overlay-styles'
import {
	computePosition,
	autoUpdate,
	applyPosition,
	applyArrowPosition,
	showFloating,
	hideFloating,
	overlayPositionProps,
	type Placement
} from '../shared/overlay'

/*
 * z-tooltip, a hover/focus label anchored to its slotted trigger. Wrap any
 * element: <z-tooltip content="Save"><z-button>…</z-button></z-tooltip>.
 * Built on the shared overlay core: a [popover=manual] surface positioned by
 * shared/overlay.ts, so it escapes overflow/stacking and flips near edges.
 * Opens after `open-delay` ms on pointerenter/focusin; closes on leave/blur or
 * Esc. Reuses the floating-surface chrome, just tighter.
 *
 * The arrow is on by default, a tooltip that does not point at anything is
 * just a floating box, and at this size the tie to the trigger is the whole
 * job. `does-hide-arrow` drops it for the rare dense cluster where several
 * tooltips share an edge.
 */
const ARROW_SIZE = 8

const styles = css`
	.surface {
		--tooltip-surface: var(--foreground);
		--tooltip-edge: color-mix(in srgb, var(--foreground) 78%, var(--background));
		padding: 0.4375rem 0.625rem;
		max-width: 16rem;
		font-size: var(--font-size-caption);
		font-weight: 500;
		line-height: 1.35;
		pointer-events: none;
		width: max-content;
		user-select: none;
		-webkit-user-select: none;
		font-weight: var(--font-weight-medium);
		/* inverse surface: reads at a glance as "not part of the page" */
		background: var(--inverse);
		color: var(--inverse-foreground);
		border: 1px solid var(--inverse);
		box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.6);
	}

	/* A square rotated onto its corner, centred exactly on the surface edge:
	   the outer half is the point, and the inner half's own background covers
	   the 1px border it straddles, so the two read as one shape. Only two of
	   its borders are drawn, the pair that meets at the leading corner. */
	.arrow {
		position: absolute;
		width: 8px;
		height: 8px;
		background: var(--inverse);
		rotate: 45deg;
	}

	/* physical: the arrow follows the side the overlay engine measured */
	.surface[data-side='top'] .arrow {
		bottom: -4px;
		left: var(--arrow-x, 50%); /* physical */
		margin-inline-start: -4px;
		border-inline-end: 1px solid var(--inverse);
		border-bottom: 1px solid var(--inverse);
	}

	.surface[data-side='bottom'] .arrow {
		top: -4px;
		left: var(--arrow-x, 50%); /* physical */
		margin-inline-start: -4px;
		border-inline-start: 1px solid var(--inverse);
		border-top: 1px solid var(--inverse);
	}

	.surface[data-side='left'] .arrow {
		right: -4px; /* physical */
		top: var(--arrow-y, 50%);
		margin-top: -4px;
		border-top: 1px solid var(--inverse);
		border-inline-end: 1px solid var(--inverse);
	}

	.surface[data-side='right'] .arrow {
		left: -4px; /* physical */
		top: var(--arrow-y, 50%);
		margin-top: -4px;
		border-bottom: 1px solid var(--inverse);
		border-inline-start: 1px solid var(--inverse);
	}

	/* a tone tints the inverse surface rather than replacing it */
	:host([tone='primary']) .surface {
		background: color-mix(in oklab, var(--inverse) 82%, var(--purple));
		border-color: transparent;
	}

	:host([tone='secondary']) .surface {
		background: color-mix(in oklab, var(--inverse) 82%, var(--pink));
		border-color: transparent;
	}
`

export const ZTooltip = c(
	(props) => {
		const host = useHost()
		const floatRef = useRef<HTMLDivElement>()
		const slotRef = useRef<HTMLSlotElement>()
		const timer = useRef<ReturnType<typeof setTimeout>>()
		const [isOpen, setIsOpen] = useState(false)

		// aria-describedby cannot point from the slotted trigger (light DOM) into
		// this shadow root, so the tooltip text is forwarded as aria-description
		// on the trigger instead — owned here, and released if the content goes.
		const described = useRef<{ element: Element; text: string }>()
		const syncDescription = () => {
			const element = slotRef.current?.assignedElements({ flatten: true })[0]
			const previous = described.current
			if (previous && (previous.element !== element || !props.content)) {
				if (previous.element.getAttribute('aria-description') === previous.text) previous.element.removeAttribute('aria-description')
				described.current = undefined
			}
			if (!element || !props.content) return
			const ownsIt = described.current?.element === element
			if (!ownsIt && element.hasAttribute('aria-description')) return
			element.setAttribute('aria-description', props.content)
			described.current = { element, text: props.content }
		}
		useEffect(syncDescription, [props.content])

		useEffect(() => {
			const floating = floatRef.current
			if (!floating || !isOpen) {
				if (floating) hideFloating(floating)
				return
			}
			showFloating(floating)
			const update = () => {
				const position = computePosition(host.current, floating, {
					placement: (props.placement as Placement) || 'top',
					offset: props.offset ?? 8
				})
				applyPosition(floating, position)
				applyArrowPosition(floating, host.current, position, ARROW_SIZE)
			}
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
				<slot ref={slotRef} onslotchange={syncDescription} />
				<div ref={floatRef} class="surface" popover="manual" role="tooltip">
					{props.content}
					{!props.doesHideArrow && <span class="arrow" aria-hidden="true" />}
				</div>
			</host>
		)
	},
	{
		props: {
			...overlayPositionProps,
			content: String,
			openDelay: { type: Number },
			doesHideArrow: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true }
		},
		styles: [floatingSurfaceStyles, styles, interactionStyles]
	}
)

defineElement('z-tooltip', ZTooltip)
