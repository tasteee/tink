import { interactionStyles } from '../shared/interaction-styles'
import { defineElement } from '../shared/define-element'
import { c, css, event, useRef, useProp, useState, useEffect } from 'atomico'
import { dialogSurfaceStyles } from '../shared/overlay-styles'
import { openModal, closeModal, interceptCancel } from '../shared/modal'
import { getDeepActiveElement, getTabbables } from '../shared/focus'
import { useLocale } from '../shared/locale'

/*
 * z-dialog, a modal built on the native <dialog> element, so focus trapping,
 * Esc-to-close, top-layer stacking, and the backdrop all come from the
 * platform rather than hand-rolled JS. An optional [slot="trigger"] opens it;
 * `heading` / `description` props (or slotted content) fill the body, and a
 * [slot="footer"] holds actions. `is-open` is reflected and two-way: set it to
 * open/close imperatively. Fires `open` and `close`. Backdrop click closes
 * unless `is-static`.
 */
const styles = css`
	.trigger {
		display: inline-flex;
	}
`

export const ZDialog = c(
	(props) => {
		const t = useLocale()
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

		// The platform makes the page inert behind a modal dialog but does not
		// wrap Tab at the dialog's edges — it walks off into the browser chrome.
		// Wrapping here keeps a keyboard user inside, footer to close button.
		const trapTab = (e: KeyboardEvent) => {
			if (e.key !== 'Tab' || !dialogRef.current) return
			const tabbables = getTabbables(dialogRef.current)
			if (tabbables.length === 0) return
			const index = tabbables.indexOf(getDeepActiveElement() as HTMLElement)
			if (e.shiftKey && index <= 0) { e.preventDefault(); tabbables[tabbables.length - 1].focus() }
			else if (!e.shiftKey && index === tabbables.length - 1) { e.preventDefault(); tabbables[0].focus() }
		}

		const onDialogClick = (e: MouseEvent) => {
			if (props.isStatic) return
			if (e.target === dialogRef.current) close()
		}

		return (
			<host shadowDom>
				<div class="trigger" onclick={() => !props.isDisabled && setIsOpen(true)}>
					<slot name="trigger" />
				</div>

				<dialog
					class="dialog"
					ref={dialogRef}
					onclick={onDialogClick}
					onkeydown={trapTab}
					oncancel={(cancelEvent: Event) => interceptCancel(cancelEvent, close)}
					aria-labelledby={props.heading ? 'dialog-title' : undefined}
					aria-label={props.label}
					aria-describedby={props.description ? 'dialog-description' : undefined}
				>
					<div class="body">
						{(props.heading || !props.isCloseHidden) && (
							<div class="header">
								{props.heading ? <h2 id="dialog-title" class="title">{props.heading}</h2> : <span />}
								{!props.isCloseHidden && (
									<button type="button" class="close" aria-label={t('close')} onclick={close}>
										<svg viewBox="0 0 24 24">
											<line x1="6" y1="6" x2="18" y2="18" />
											<line x1="18" y1="6" x2="6" y2="18" />
										</svg>
									</button>
								)}
							</div>
						)}
						{props.description && <p id="dialog-description" class="description">{props.description}</p>}
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
			label: String,
			description: String,
			isCloseHidden: { type: Boolean, reflect: true },
			isStatic: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			open: event<void>({ bubbles: true, composed: true }),
			close: event<void>({ bubbles: true, composed: true })
		},
		styles: [dialogSurfaceStyles, styles, interactionStyles]
	}
)

defineElement('z-dialog', ZDialog)
