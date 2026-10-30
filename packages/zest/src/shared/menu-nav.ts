/*
 * Shared keyboard-trap math for the text-editor menu family (z-slash-menu,
 * z-mention-popover, and the heading dropdown inside z-format-toolbar). The
 * ↑/↓/Enter/Escape nav loop was previously duplicated per-component (see
 * z-menu.tsx, z-context-menu.tsx, z-command.tsx), this factors the pure math
 * out; each component still owns its own isOpen/activeIndex state via useState
 * and wires this in from its own onkeydown, matching the shared/overlay.ts
 * precedent of plain functions orchestrated locally rather than a custom hook.
 */

export const moveActiveIndex = (
	current: number,
	direction: number,
	itemCount: number,
	isSelectable: (index: number) => boolean
): number => {
	if (itemCount <= 0) return -1
	let next = current

	for (let i = 0; i < itemCount; i++) {
		next = (next + direction + itemCount) % itemCount
		if (isSelectable(next)) break
	}

	return next
}

export type MenuNavOptionsT = {
	isOpen: boolean
	itemCount: number
	activeIndex: number
	isSelectable: (index: number) => boolean
	onOpen: () => void
	onMove: (index: number) => void
	onCommit: (index: number) => void
	onClose: () => void
}

/** Builds an onkeydown handler implementing the trap: ↑/↓ move (skipping
 *  non-selectable rows), Enter/Space commit, Escape releases the trap. */
export const createMenuKeyDownHandler = (options: MenuNavOptionsT) => (event: KeyboardEvent) => {
	if (event.key === 'Escape') {
		options.onClose()
		return
	}

	if (event.key === 'ArrowDown') {
		event.preventDefault()
		if (!options.isOpen) options.onOpen()
		else options.onMove(moveActiveIndex(options.activeIndex, 1, options.itemCount, options.isSelectable))
		return
	}

	if (event.key === 'ArrowUp') {
		event.preventDefault()
		if (!options.isOpen) options.onOpen()
		else options.onMove(moveActiveIndex(options.activeIndex, -1, options.itemCount, options.isSelectable))
		return
	}

	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		if (!options.isOpen) options.onOpen()
		else if (options.activeIndex >= 0) options.onCommit(options.activeIndex)
	}
}

export type LiveQueryMenuNavOptionsT = {
	itemCount: number
	activeIndex: number
	isSelectable: (index: number) => boolean
	onMove: (index: number) => void
	onCommit: (index: number) => void
	onClose: () => void
}

/** Keydown trap for menus driven by a live-typed query (z-slash-menu,
 *  z-mention-popover): unlike createMenuKeyDownHandler, Space is never a
 *  commit key here, it's an ordinary character the host document is still
 *  typing, so only ArrowUp/ArrowDown/Enter/Escape are intercepted. */
export const createLiveQueryMenuKeyDownHandler = (options: LiveQueryMenuNavOptionsT) => (event: KeyboardEvent) => {
	if (event.key === 'Escape') {
		options.onClose()
		return
	}

	if (event.key === 'ArrowDown') {
		event.preventDefault()
		options.onMove(moveActiveIndex(options.activeIndex, 1, options.itemCount, options.isSelectable))
		return
	}

	if (event.key === 'ArrowUp') {
		event.preventDefault()
		options.onMove(moveActiveIndex(options.activeIndex, -1, options.itemCount, options.isSelectable))
		return
	}

	if (event.key === 'Enter') {
		event.preventDefault()
		if (options.activeIndex >= 0) options.onCommit(options.activeIndex)
	}
}

/*
 * Selection feedback: the picked row blinks its highlight twice, then the
 * menu commits. The `select` event fires only once the flash ends, so
 * whatever the selection opens (a dialog, a route) arrives after the menu has
 * visibly confirmed the pick, never on top of a still-blinking row. The whole
 * flash is ~130ms; with reduced motion it's skipped and the commit is
 * immediate. Pair with `menuFlashStyles` in the menu's stylesheet.
 */
export const MENU_FLASH_MS = 130

const prefersReducedMotion = (): boolean =>
	typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Run `done` after the flash, or straight away under reduced motion. The
 *  caller renders the flashing row with the `is-flashing` class meanwhile
 *  (part of its render output, so re-renders can't strip it mid-flash). */
export const flashThen = (done: () => void): void => {
	if (prefersReducedMotion()) done()
	else setTimeout(done, MENU_FLASH_MS)
}
