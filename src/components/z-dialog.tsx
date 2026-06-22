import { c, css, event, useRef, useProp, useState, useEffect } from 'atomico'
import { dialogSurfaceStyles } from '../shared/overlay-styles'

/*
 * z-dialog — a modal built on the native <dialog> element, so focus trapping,
 * Esc-to-close, top-layer stacking, and the backdrop all come from the
 * platform rather than hand-rolled JS. An optional [slot="trigger"] opens it;
 * `heading` / `description` props (or slotted content) fill the body, and a
 * [slot="footer"] holds actions. `is-open` is reflected and two-way: set it to
 * open/close imperatively. Fires `open` and `close`. Backdrop click closes
 * unless `is-static`.
 */
const SIZE_WIDTH: Record<string, string> = {
	small: '24rem',
	medium: '30rem',
	large: '42rem'
}

const styles = css`
	.trigger {
		display: inline-flex;
	}
`

export const ZDialog = c(
	(props) => {
		const dialogRef = useRef<HTMLDialogElement>()
		const [isOpen, setIsOpen] = useProp<boolean>('isOpen')
		const [hasFooter, setHasFooter] = useState(false)

		useEffect(() => {
			const dialog = dialogRef.current
			if (!dialog) return
			if (isOpen && !dialog.open) {
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

		const width = SIZE_WIDTH[props.size as string] || SIZE_WIDTH.medium

		return (
			<host shadowDom style={{ '--z-dialog-width': width }}>
				<div class="trigger" onclick={() => !props.isDisabled && setIsOpen(true)}>
					<slot name="trigger" />
				</div>

				<dialog class="dialog" ref={dialogRef} onclick={onDialogClick}>
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
							onslotchange={(e: Event) =>
								setHasFooter((e.target as HTMLSlotElement).assignedNodes().length > 0)
							}
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
			size: { type: String, reflect: true },
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

customElements.define('z-dialog', ZDialog)
