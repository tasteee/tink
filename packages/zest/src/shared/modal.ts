/*
 * Shared open/close choreography for every native-<dialog> surface (z-dialog,
 * z-alert-dialog, z-sheet, z-drawer, z-command).
 *
 * The platform's own exit path (`overlay` / `display` allow-discrete
 * transitions) isn't supported everywhere, and where it isn't the dialog
 * vanishes the instant close() runs. So the exit is driven here instead:
 *
 *   open   showModal() → reflow → data-state="open"   (CSS transitions in)
 *   close  data-state="closing" → wait for the exit transition → close()
 *
 * The dialog stays in the top layer (with its backdrop and shadow) for the
 * whole exit, so the surface and backdrop leave together, however it was
 * dismissed. Reopening mid-exit cancels the pending close and reverses from
 * wherever the transition currently is.
 */

import { runExit, cancelExit } from './presence'

/** Show the dialog modally and transition it in. Returns true when it actually opened. */
export const openModal = (dialog: HTMLDialogElement): boolean => {
	cancelExit(dialog)
	const wasOpen = dialog.open
	if (!wasOpen) {
		delete dialog.dataset.state
		dialog.showModal()
		// commit the hidden starting style before flipping to open, otherwise the
		// browser batches both and nothing transitions.
		void dialog.offsetWidth
	}
	dialog.dataset.state = 'open'
	return !wasOpen
}

/** Transition the dialog out, then close() it once the exit has finished. */
export const closeModal = (dialog: HTMLDialogElement, onClosed?: () => void): void => {
	if (!dialog.open || dialog.dataset.state === 'closing') return
	runExit(dialog, () => {
		dialog.close()
		onClosed?.()
	})
}

/**
 * Route Esc through the animated close: the native `cancel` event would
 * otherwise close the dialog immediately. Attach as the dialog's oncancel.
 */
export const interceptCancel = (e: Event, requestClose: () => void): void => {
	e.preventDefault()
	requestClose()
}
