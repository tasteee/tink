import { interactionStyles } from '../shared/interaction-styles'
import { defineElement } from '../shared/define-element'
import { c, css, event, useRef, useProp, useEffect } from 'atomico'
import { dialogSurfaceStyles } from '../shared/overlay-styles'
import { openModal, closeModal } from '../shared/modal'
import { oneOf } from '../shared/prop-types'
import { useLocale } from '../shared/locale'

/*
 * z-alert-dialog, a confirmation modal for destructive or consequential
 * choices. Same native-<dialog> foundation and chrome as z-dialog, but it owns
 * its two actions (cancel + confirm) instead of a free-form footer, and it is
 * intentionally non-light-dismissable: clicking the backdrop does nothing, and
 * Esc resolves as an explicit cancel. `tone="danger"` paints the confirm button
 * with the destructive color. Fires `confirm` and `cancel`.
 */
const styles = css`
	.trigger {
		display: inline-flex;
	}

	.footer {
		padding-top: var(--space-md);
	}
`

export const ZAlertDialog = c(
	(props) => {
		const t = useLocale()
		const dialogRef = useRef<HTMLDialogElement>()
		const [isOpen, setIsOpen] = useProp<boolean>('isOpen')

		useEffect(() => {
			const dialog = dialogRef.current
			if (!dialog) return
			if (isOpen) openModal(dialog)
			else closeModal(dialog)
		}, [isOpen])

		const resolve = (confirmed: boolean) => {
			setIsOpen(false)
			if (confirmed) props.confirm()
			else props.cancel()
		}

		// The dialog and its confirm button now share one accent vocabulary, so
		// the value passes straight through instead of being remapped.
		const confirmAccent = props.tone || 'primary'

		return (
			<host shadowDom style={{ '--z-dialog-width': '26rem' }}>
				<div class="trigger" onclick={() => setIsOpen(true)}>
					<slot name="trigger" />
				</div>

				<dialog
					class="dialog"
					ref={dialogRef}
					role="alertdialog"
					aria-labelledby={props.heading ? 'alert-dialog-title' : undefined}
					aria-describedby={props.description ? 'alert-dialog-description' : undefined}
					oncancel={(e: Event) => {
						e.preventDefault()
						resolve(false)
					}}
				>
					<div class="body">
						{props.heading && <h2 id="alert-dialog-title" class="title">{props.heading}</h2>}
						{props.description && <p id="alert-dialog-description" class="description">{props.description}</p>}
						<slot />
					</div>
					<div class="footer">
						<z-button kind="outline" tone="neutral" onclick={() => resolve(false)}>
							{props.cancelLabel || t('cancel')}
						</z-button>
						<z-button kind="solid" tone={confirmAccent} onclick={() => resolve(true)}>
							{props.confirmLabel || t('confirm')}
						</z-button>
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
			confirmLabel: String,
			cancelLabel: String,
			tone: { type: oneOf('primary', 'secondary', 'danger'), reflect: true },
			confirm: event<void>({ bubbles: true, composed: true }),
			cancel: event<void>({ bubbles: true, composed: true })
		},
		styles: [dialogSurfaceStyles, styles, interactionStyles]
	}
)

defineElement('z-alert-dialog', ZAlertDialog)
