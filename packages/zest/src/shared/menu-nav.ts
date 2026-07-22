/*
 * Shared keyboard-trap math for the text-editor menu family (z-slash-menu,
 * z-mention-popover, and the heading dropdown inside z-format-toolbar). The
 * ↑/↓/Enter/Escape nav loop was previously duplicated per-component (see
 * z-menu.tsx, z-context-menu.tsx, z-command.tsx) — this factors the pure math
 * out; each component still owns its own isOpen/activeIndex state via useState
 * and wires this in from its own onkeydown, matching the shared/overlay.ts
 * precedent of plain functions orchestrated locally rather than a custom hook.
 */

export const moveActiveIndex = (current: number, direction: number, itemCount: number, isSelectable: (index: number) => boolean): number => {
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
 *  commit key here — it's an ordinary character the host document is still
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
