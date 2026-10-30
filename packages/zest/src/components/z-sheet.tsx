import { c, css, event, useRef, useProp, useState, useEffect } from 'atomico'
import { dialogSurfaceStyles } from '../shared/overlay-styles'
import { openModal, closeModal, interceptCancel } from '../shared/modal'

/*
 * z-sheet, a panel that slides in from an edge (`side`: right | left | top |
 * bottom). Same native-<dialog> foundation as z-dialog, modal focus trap, Esc,
 * backdrop, and reuses its body/header/footer chrome; only the geometry and
 * the slide transition differ. Full-bleed against its edge, sized by
 * `--z-sheet-size`. Backdrop click dismisses unless `is-static`.
 */
const styles = css`
	.trigger {
		display: inline-flex;
	}

	/* Slides in from its edge and retraces the same path on exit, so dismissing
	   by X, backdrop, or Esc all read as the sheet going back where it came
	   from. Hidden state = offset by its own size; shared/modal.ts flips
	   data-state. Timings come from the motion scale (slow in, slow-exit out). */
	.dialog {
		--sheet-from: calc(100% * var(--motion-travel)) 0;
		position: fixed;
		margin: 0;
		max-width: none;
		max-height: none;
		border-radius: 0;
		width: min(var(--z-sheet-size, 22rem), 100vw);
		height: 100%;
		inset: 0 0 0 auto;
		scale: 1;
		translate: var(--sheet-from);
		transition:
			opacity var(--motion-exit-slow) var(--ease-exit),
			translate var(--motion-exit-slow) var(--ease-exit);
	}

	.dialog[data-state='open'] {
		scale: 1;
		translate: 0 0;
		transition:
			opacity var(--motion-slow) var(--ease-enter),
			translate var(--motion-slow) var(--ease-enter);
	}

	.dialog::backdrop {
		transition: opacity var(--motion-exit-slow) var(--ease-exit);
	}
	.dialog[data-state='open']::backdrop {
		transition: opacity var(--motion-slow) var(--ease-enter);
	}

	:host([side='left']) .dialog {
		--sheet-from: calc(-100% * var(--motion-travel)) 0;
		inset: 0 auto 0 0;
	}

	:host([side='top']) .dialog {
		--sheet-from: 0 calc(-100% * var(--motion-travel));
		inset: 0 0 auto 0;
		width: 100%;
		height: auto;
		max-height: 85vh;
	}

	:host([side='bottom']) .dialog {
		--sheet-from: 0 calc(100% * var(--motion-travel));
		inset: auto 0 0 0;
		width: 100%;
		height: auto;
		max-height: 85vh;
	}

	.body {
		flex: 1;
	}
`

export const ZSheet = c(
	(props) => {
		const dialogRef = useRef<HTMLDialogElement>()
		const [isOpen, setIsOpen] = useProp<boolean>('isOpen')
		const [hasFooter, setHasFooter] = useState(false)

		useEffect(() => {
			const dialog = dialogRef.current
			if (!dialog) return
			if (isOpen) {
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

		return (
			<host shadowDom>
				<div class="trigger" onclick={() => !props.isDisabled && setIsOpen(true)}>
					<slot name="trigger" />
				</div>

				<dialog class="dialog" ref={dialogRef} onclick={onDialogClick} oncancel={(e: Event) => interceptCancel(e, close)}>
					<div class="body">
						{(props.heading || !props.hideClose) && (
							<div class="header">
								{props.heading ? <h2 class="title">{props.heading}</h2> : <span />}
								{!props.hideClose && (
									<button type="button" class="close" aria-label="Close" onclick={close}>
										<svg viewBox="0 0 24 24">
											<line x1="6" y1="6" x2="18" y2="18" />
											<line x1="18" y1="6" x2="6" y2="18" />
										</svg>
									</button>
								)}
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
			side: { type: String, reflect: true },
			heading: String,
			description: String,
			tone: { type: String, reflect: true },
			hideClose: { type: Boolean, reflect: true },
			isStatic: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			open: event<void>({ bubbles: true, composed: true }),
			close: event<void>({ bubbles: true, composed: true })
		},
		styles: [dialogSurfaceStyles, styles]
	}
)

customElements.define('z-sheet', ZSheet)
