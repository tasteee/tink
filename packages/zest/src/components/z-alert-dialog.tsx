import { c, css, event, useRef, useProp, useEffect } from 'atomico'
import { dialogSurfaceStyles } from '../shared/overlay-styles'

/*
 * z-alert-dialog — a confirmation modal for destructive or consequential
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
		const dialogRef = useRef<HTMLDialogElement>()
		const [isOpen, setIsOpen] = useProp<boolean>('isOpen')

		useEffect(() => {
			const dialog = dialogRef.current
			if (!dialog) return
			if (isOpen && !dialog.open) dialog.showModal()
			else if (!isOpen && dialog.open) dialog.close()
		}, [isOpen])

		const resolve = (confirmed: boolean) => {
			setIsOpen(false)
			if (confirmed) props.confirm()
			else props.cancel()
		}

		const confirmTone = props.tone === 'danger' ? 'danger' : props.tone === 'secondary' ? 'secondary' : 'primary'

		return (
			<host shadowDom style={{ '--z-dialog-width': '26rem' }}>
				<div class="trigger" onclick={() => setIsOpen(true)}>
					<slot name="trigger" />
				</div>

				<dialog
					class="dialog"
					ref={dialogRef}
					role="alertdialog"
					oncancel={(e: Event) => {
						e.preventDefault()
						resolve(false)
					}}
				>
					<div class="body">
						{props.heading && <h2 class="title">{props.heading}</h2>}
						{props.description && <p class="description">{props.description}</p>}
						<slot />
					</div>
					<div class="footer">
						<z-button kind="outline" tone="neutral" onclick={() => resolve(false)}>
							{props.cancelLabel || 'Cancel'}
						</z-button>
						<z-button kind="solid" tone={confirmTone} onclick={() => resolve(true)}>
							{props.confirmLabel || 'Confirm'}
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
			tone: { type: String, reflect: true },
			confirm: event<void>({ bubbles: true, composed: true }),
			cancel: event<void>({ bubbles: true, composed: true })
		},
		styles: [dialogSurfaceStyles, styles]
	}
)

customElements.define('z-alert-dialog', ZAlertDialog)
