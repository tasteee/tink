import { c, css, event, useHost, useEffect } from 'atomico'
import { floatingIconButtonStyles } from '../shared/editor-overlay-styles'
import { AnyProp } from '../shared/overlay'
import { useVisibilityPhase } from '../shared/transition'

/*
 * z-gutter-handle — a singleton left-gutter control that teleports to
 * whichever block the pointer is over. Place one instance on the page and
 * drive it from your block-hover tracking:
 *   const gutter = document.querySelector('z-gutter-handle')
 *   gutter.anchorRect = blockEl.getBoundingClientRect()
 *   gutter.isOpen = true
 * Contains a "+" (insert block) button and a drag grip. The grip is a native
 * `draggable` element — listen for `dragstart`/`dragend` directly on the host
 * (drag events are composed, so they cross the shadow boundary) to wire real
 * reordering, e.g. together with z-drag-handle's ghost/drop-indicator. Fires
 * `add` on the + button.
 */
const styles = css`
	:host {
		position: fixed;
		left: 0;
		top: 0;
		z-index: var(--z-toolbar, 40);
		display: flex;
		align-items: center;
		gap: 1px;
		opacity: 0;
		transform: translateX(4px);
		pointer-events: none;
	}

	:host(.is-open) {
		opacity: 1;
		transform: translateX(0);
		transition:
			opacity 120ms ease-out,
			transform 120ms ease-out;
		pointer-events: auto;
	}

	:host(.is-closing) {
		opacity: 0;
		transform: translateX(0);
		transition: opacity 80ms ease-out;
		pointer-events: none;
	}

	.grip {
		cursor: grab;
	}

	.grip:active {
		cursor: grabbing;
	}
`

export const ZGutterHandle = c(
	(props) => {
		const host = useHost()
		const isOpen = Boolean(props.isOpen)
		const phase = useVisibilityPhase(isOpen)

		useEffect(() => {
			const el = host.current as HTMLElement
			if (!el || !props.anchorRect) return
			const rect = props.anchorRect as { x: number; y: number; width: number; height: number }
			// center the handle vertically on the block, sit just left of it
			el.style.left = `${rect.x - (props.width ?? 44)}px`
			el.style.top = `${rect.y + rect.height / 2 - 12}px`
		}, [props.anchorRect, props.width])

		useEffect(() => {
			const el = host.current as HTMLElement
			el.classList.toggle('is-open', phase === 'open')
			el.classList.toggle('is-closing', phase === 'closing')
		}, [phase])

		return (
			<host shadowDom>
				<button type="button" class="icon-button" aria-label="Add block below" onclick={() => props.add()}>
					<svg viewBox="0 0 24 24">
						<line x1="12" y1="5" x2="12" y2="19" />
						<line x1="5" y1="12" x2="19" y2="12" />
					</svg>
				</button>
				<button type="button" class="icon-button grip" aria-label="Drag to reorder" draggable={true}>
					<svg viewBox="0 0 24 24">
						<circle cx="9" cy="6" r="1" />
						<circle cx="9" cy="12" r="1" />
						<circle cx="9" cy="18" r="1" />
						<circle cx="15" cy="6" r="1" />
						<circle cx="15" cy="12" r="1" />
						<circle cx="15" cy="18" r="1" />
					</svg>
				</button>
			</host>
		)
	},
	{
		props: {
			anchorRect: AnyProp,
			width: { type: Number },
			isOpen: { type: Boolean, reflect: true },
			add: event<void>({ bubbles: true, composed: true })
		},
		styles: [floatingIconButtonStyles, styles]
	}
)

customElements.define('z-gutter-handle', ZGutterHandle)
