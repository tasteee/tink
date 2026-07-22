import { c, css, useHost, useRef, useEffect } from 'atomico'
import { AnyProp } from '../shared/overlay'
import { useVisibilityPhase } from '../shared/transition'

/*
 * z-drag-handle — a standalone grip button that initiates a block reorder
 * drag (usable on its own, e.g. in a list row, or alongside z-gutter-handle's
 * own grip). It's a real `draggable` element, so the browser's native
 * dragstart/drag/dragend events fire and bubble/compose out of the shadow
 * root as usual — listen for them directly on the element rather than a
 * custom-event wrapper. Its own dragstart sets a small block-preview ghost
 * (built from the `label` prop) as the native drag image, so you don't have
 * to build one yourself:
 *   const grip = document.querySelector('z-drag-handle')
 *   grip.label = block.textContent.slice(0, 40)
 *   grip.addEventListener('dragstart', (e) => trackDrag(e))
 *
 * z-drop-indicator (second export below) is the singleton line that follows
 * the gap between blocks while dragging — teleport it the same way as
 * z-gutter-handle:
 *   const indicator = document.querySelector('z-drop-indicator')
 *   indicator.anchorRect = gapRect
 *   indicator.isOpen = true
 */
const dragHandleStyles = css`
	:host {
		display: inline-flex;
	}

	.grip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		background: transparent;
		border: 0;
		border-radius: var(--radius-sm);
		color: var(--muted-foreground);
		cursor: grab;
		transition:
			color 0.12s ease,
			background-color 0.12s ease;
	}

	.grip:hover {
		color: var(--foreground);
		background: color-mix(in oklch, var(--foreground) 8%, transparent);
	}

	.grip:active {
		cursor: grabbing;
	}

	.grip:disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	.grip svg {
		width: 1.125rem;
		height: 1.125rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		fill: none;
	}

	.ghost {
		position: fixed;
		top: -1000px;
		left: -1000px;
		max-width: 16rem;
		padding: 0.5rem 0.75rem;
		background: var(--popover);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--foreground);
		font-family: inherit;
		font-size: var(--font-size-small);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
`

export const ZDragHandle = c(
	(props) => {
		const ghostRef = useRef<HTMLDivElement>()

		const onDragStart = (dragEvent: DragEvent) => {
			const ghost = ghostRef.current
			if (ghost && dragEvent.dataTransfer) dragEvent.dataTransfer.setDragImage(ghost, 12, 12)
		}

		return (
			<host shadowDom>
				<button type="button" class="grip" draggable={true} disabled={props.isDisabled} aria-label="Drag to reorder" ondragstart={onDragStart}>
					<svg viewBox="0 0 24 24">
						<circle cx="9" cy="6" r="1" />
						<circle cx="9" cy="12" r="1" />
						<circle cx="9" cy="18" r="1" />
						<circle cx="15" cy="6" r="1" />
						<circle cx="15" cy="12" r="1" />
						<circle cx="15" cy="18" r="1" />
					</svg>
				</button>
				<div ref={ghostRef} class="ghost">
					{props.label || 'Block'}
				</div>
			</host>
		)
	},
	{
		props: {
			label: String,
			isDisabled: { type: Boolean, reflect: true }
		},
		styles: dragHandleStyles
	}
)

customElements.define('z-drag-handle', ZDragHandle)

const dropIndicatorStyles = css`
	:host {
		position: fixed;
		left: 0;
		top: 0;
		z-index: var(--z-overlay, 60);
		display: block;
		height: 2px;
		border-radius: 999px;
		background: var(--accent, var(--purple));
		opacity: 0;
		pointer-events: none;
	}

	:host(.is-open) {
		opacity: 1;
		transition: opacity 120ms ease-out;
	}

	:host(.is-closing) {
		opacity: 0;
		transition: opacity 80ms ease-out;
	}

	:host([orientation='vertical']) {
		width: 2px;
		height: auto;
	}
`

export const ZDropIndicator = c(
	(props) => {
		const host = useHost()
		const isOpen = Boolean(props.isOpen)
		const phase = useVisibilityPhase(isOpen)

		useEffect(() => {
			const el = host.current as HTMLElement
			if (!el || !props.anchorRect) return
			const rect = props.anchorRect as { x: number; y: number; width: number; height: number }
			el.style.left = `${rect.x}px`
			el.style.top = `${rect.y}px`
			el.style.width = `${rect.width}px`
			el.style.height = `${rect.height}px`
		}, [props.anchorRect])

		useEffect(() => {
			const el = host.current as HTMLElement
			el.classList.toggle('is-open', phase === 'open')
			el.classList.toggle('is-closing', phase === 'closing')
		}, [phase])

		return <host shadowDom role="presentation"></host>
	},
	{
		props: {
			anchorRect: AnyProp,
			orientation: { type: String, reflect: true },
			isOpen: { type: Boolean, reflect: true }
		},
		styles: dropIndicatorStyles
	}
)

customElements.define('z-drop-indicator', ZDropIndicator)
