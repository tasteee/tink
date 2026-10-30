import { c, css, event, useRef, useProp, useState, useEffect } from 'atomico'
import { dialogSurfaceStyles } from '../shared/overlay-styles'
import { openModal, closeModal, interceptCancel } from '../shared/modal'

/*
 * z-drawer, a bottom drawer (vaul-style) on the native <dialog> foundation:
 * rounded top, a grab handle, and drag-to-dismiss. Shares z-dialog's chrome and
 * modal behavior; what sets it apart from z-sheet is the handle and the pointer
 * drag, pull it down past a threshold to close, or release short to snap back.
 * Backdrop click dismisses unless `is-static`.
 */
const styles = css`
	.trigger {
		display: inline-flex;
	}

	/* Slides up from the bottom edge and back down on exit (shared/modal.ts
	   flips data-state). A drag-dismiss releases the inline drag offset so the
	   exit continues from wherever the pointer let go. */
	.dialog {
		position: fixed;
		inset: auto 0 0 0;
		margin: 0;
		width: 100%;
		max-width: none;
		height: auto;
		max-height: 90vh;
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		scale: 1;
		translate: 0 calc(100% * var(--motion-travel));
		transition:
			opacity var(--motion-exit-slow) var(--ease-exit),
			translate var(--motion-exit-slow) var(--ease-exit);
		touch-action: none;
	}

	.dialog[data-state='open'] {
		scale: 1;
		translate: 0 0;
		transition:
			opacity var(--motion-slow) var(--ease-enter),
			translate var(--motion-slow) var(--ease-enter);
	}

	.dialog.is-dragging {
		transition: none;
	}

	.dialog::backdrop {
		transition: opacity var(--motion-exit-slow) var(--ease-exit);
	}
	.dialog[data-state='open']::backdrop {
		transition: opacity var(--motion-slow) var(--ease-enter);
	}

	.handle-area {
		display: flex;
		justify-content: center;
		padding: 0.75rem 0 0.25rem;
		cursor: grab;
		touch-action: none;
	}

	.handle-area:active {
		cursor: grabbing;
	}

	.handle {
		width: 2.5rem;
		height: 0.3125rem;
		border-radius: 999px;
		background: var(--border);
	}

	.body {
		flex: 1;
		padding-top: 0.5rem;
	}
`

export const ZDrawer = c(
	(props) => {
		const dialogRef = useRef<HTMLDialogElement>()
		const dragStart = useRef<number | null>(null)
		const dragDelta = useRef(0)
		const [isOpen, setIsOpen] = useProp<boolean>('isOpen')
		const [hasFooter, setHasFooter] = useState(false)

		useEffect(() => {
			const dialog = dialogRef.current
			if (!dialog) return
			if (isOpen) {
				dialog.style.translate = ''
				if (openModal(dialog)) props.open()
			} else {
				closeModal(dialog)
			}
		}, [isOpen])

		useEffect(() => {
			const dialog = dialogRef.current
			if (!dialog) return
			const onClose = () => {
				if (isOpen) setIsOpen(false)
				props.close()
			}
			dialog.addEventListener('close', onClose)
			return () => dialog.removeEventListener('close', onClose)
		}, [isOpen])

		const close = () => setIsOpen(false)

		const onDialogClick = (e: MouseEvent) => {
			if (props.isStatic) return
			if (e.target === dialogRef.current) close()
		}

		const onPointerDown = (e: PointerEvent) => {
			dragStart.current = e.clientY
			dragDelta.current = 0
			const dialog = dialogRef.current
			if (dialog) dialog.classList.add('is-dragging')
			;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
		}

		const onPointerMove = (e: PointerEvent) => {
			if (dragStart.current == null) return
			const dialog = dialogRef.current
			if (!dialog) return
			dragDelta.current = Math.max(0, e.clientY - dragStart.current)
			dialog.style.translate = `0 ${dragDelta.current}px`
		}

		const onPointerUp = () => {
			const dialog = dialogRef.current
			if (dragStart.current == null || !dialog) return
			dragStart.current = null
			dialog.classList.remove('is-dragging')
			const threshold = Math.min(160, dialog.offsetHeight * 0.4)
			// releasing the inline offset hands translate back to the stylesheet, so
			// it transitions from the dragged position, down and out, or back home.
			dialog.style.translate = ''
			if ((dragDelta.current ?? 0) > threshold) close()
		}

		return (
			<host shadowDom>
				<div class="trigger" onclick={() => !props.isDisabled && setIsOpen(true)}>
					<slot name="trigger" />
				</div>

				<dialog class="dialog" ref={dialogRef} onclick={onDialogClick} oncancel={(e: Event) => interceptCancel(e, close)}>
					<div
						class="handle-area"
						onpointerdown={onPointerDown}
						onpointermove={onPointerMove}
						onpointerup={onPointerUp}
						onpointercancel={onPointerUp}
					>
						<span class="handle" aria-hidden="true" />
					</div>
					<div class="body">
						{props.heading && (
							<div class="header">
								<h2 class="title">{props.heading}</h2>
							</div>
						)}
						{props.description && <p class="description">{props.description}</p>}
						<slot />
					</div>
					<div class="footer" style={hasFooter ? '' : 'display: none'}>
						<slot
							name="footer"
							onslotchange={(e: Event) => setHasFooter((e.target as HTMLSlotElement).assignedNodes().length > 0)}
						/>
					</div>
				</dialog>
			</host>
		)
	},
	{
		props: {
			isOpen: { type: Boolean, reflect: true },
			heading: String,
			description: String,
			tone: { type: String, reflect: true },
			isStatic: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			open: event<void>({ bubbles: true, composed: true }),
			close: event<void>({ bubbles: true, composed: true })
		},
		styles: [dialogSurfaceStyles, styles]
	}
)

customElements.define('z-drawer', ZDrawer)
