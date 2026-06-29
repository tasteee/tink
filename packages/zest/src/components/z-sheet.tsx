import { c, css, event, useRef, useProp, useState, useEffect } from 'atomico'
import { dialogSurfaceStyles } from '../shared/overlay-styles'

/*
 * z-sheet — a panel that slides in from an edge (`side`: right | left | top |
 * bottom). Same native-<dialog> foundation as z-dialog — modal focus trap, Esc,
 * backdrop — and reuses its body/header/footer chrome; only the geometry and
 * the slide transition differ. Full-bleed against its edge, sized by
 * `--z-sheet-size`. Backdrop click dismisses unless `is-static`.
 */
const styles = css`
	.trigger {
		display: inline-flex;
	}

	/* Slide + fade IN, fade-only OUT: the slide offset lives only in
	   @starting-style (the entry start), while the closed/base state keeps
	   translate at 0 and just drops opacity — so the exit transition has no
	   offset to animate toward and the panel simply fades away in place. */
	.dialog {
		position: fixed;
		margin: 0;
		max-width: none;
		max-height: none;
		border-radius: 0;
		width: min(var(--z-sheet-size, 22rem), 100vw);
		height: 100%;
		inset: 0 0 0 auto;
		opacity: 0;
		transition:
			translate 0.25s ease,
			opacity 0.2s ease,
			overlay 0.25s allow-discrete,
			display 0.25s allow-discrete;
	}

	.dialog[open] {
		opacity: 1;
		translate: 0 0;
	}

	@starting-style {
		.dialog[open] {
			opacity: 0;
			translate: 100% 0;
		}
	}

	:host([side='left']) .dialog {
		inset: 0 auto 0 0;
	}
	@starting-style {
		:host([side='left']) .dialog[open] {
			translate: -100% 0;
		}
	}

	:host([side='top']) .dialog {
		inset: 0 0 auto 0;
		width: 100%;
		height: auto;
		max-height: 85vh;
	}
	@starting-style {
		:host([side='top']) .dialog[open] {
			translate: 0 -100%;
		}
	}

	:host([side='bottom']) .dialog {
		inset: auto 0 0 0;
		width: 100%;
		height: auto;
		max-height: 85vh;
	}
	@starting-style {
		:host([side='bottom']) .dialog[open] {
			translate: 0 100%;
		}
	}

	.dialog::backdrop {
		opacity: 0;
		transition:
			opacity 0.25s ease,
			overlay 0.25s allow-discrete,
			display 0.25s allow-discrete;
	}
	.dialog[open]::backdrop {
		opacity: 1;
	}
	@starting-style {
		.dialog[open]::backdrop {
			opacity: 0;
		}
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

		return (
			<host shadowDom>
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
