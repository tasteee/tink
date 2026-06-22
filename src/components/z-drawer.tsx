import { c, css, event, useRef, useProp, useState, useEffect } from 'atomico'
import { dialogSurfaceStyles } from '../shared/overlay-styles'

/*
 * z-drawer — a bottom drawer (vaul-style) on the native <dialog> foundation:
 * rounded top, a grab handle, and drag-to-dismiss. Shares z-dialog's chrome and
 * modal behavior; what sets it apart from z-sheet is the handle and the pointer
 * drag — pull it down past a threshold to close, or release short to snap back.
 * Backdrop click dismisses unless `is-static`.
 */
const styles = css`
	.trigger {
		display: inline-flex;
	}

	/* Slide + fade IN, fade-only OUT (see z-sheet): the slide offset is only in
	   @starting-style; the closed state keeps translate 0 and drops opacity, so a
	   non-drag close just fades. (A drag-dismiss animates from the dragged offset.) */
	.dialog {
		position: fixed;
		inset: auto 0 0 0;
		margin: 0;
		width: 100%;
		max-width: none;
		height: auto;
		max-height: 90vh;
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		opacity: 0;
		transition:
			translate 0.3s ease,
			opacity 0.22s ease,
			overlay 0.3s allow-discrete,
			display 0.3s allow-discrete;
		touch-action: none;
	}

	.dialog[open] {
		opacity: 1;
		translate: 0 0;
	}

	@starting-style {
		.dialog[open] {
			opacity: 0;
			translate: 0 100%;
		}
	}

	.dialog.is-dragging {
		transition: none;
	}

	.dialog::backdrop {
		opacity: 0;
		transition:
			opacity 0.3s ease,
			overlay 0.3s allow-discrete,
			display 0.3s allow-discrete;
	}
	.dialog[open]::backdrop {
		opacity: 1;
	}
	@starting-style {
		.dialog[open]::backdrop {
			opacity: 0;
		}
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
			if (isOpen && !dialog.open) {
				// clear any leftover drag offset before opening so the entry animates
				// cleanly from the @starting-style offset.
				dialog.style.translate = ''
				dialog.showModal()
				props.open()
			} else if (!isOpen && dialog.open) {
				dialog.close()
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
			if ((dragDelta.current ?? 0) > threshold) {
				// leave the inline drag offset in place so it fades out from where the
				// pointer left it (reset happens on next open); just close.
				close()
			} else {
				dialog.style.translate = '0 0'
			}
		}

		return (
			<host shadowDom>
				<div class="trigger" onclick={() => !props.isDisabled && setIsOpen(true)}>
					<slot name="trigger" />
				</div>

				<dialog class="dialog" ref={dialogRef} onclick={onDialogClick}>
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
