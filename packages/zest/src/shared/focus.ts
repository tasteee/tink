/*
 * Focus utilities that understand shadow DOM.
 *
 * `getTabbables` walks the flat tree — light children, slotted content and
 * open shadow roots — and returns the elements a Tab press would visit, in
 * order. The platform has no API for this, and a modal that wants to wrap
 * focus at its edges needs it.
 */

const TABBABLE = 'a[href], area[href], button, input, select, textarea, iframe, summary, [tabindex], [contenteditable="true"]'

const isVisible = (element: HTMLElement): boolean => {
	if (element.hidden) return false
	const style = getComputedStyle(element)
	return style.display !== 'none' && style.visibility !== 'hidden'
}

const isTabbable = (element: HTMLElement): boolean => {
	if (!element.matches(TABBABLE)) return false
	if ((element as HTMLButtonElement).disabled) return false
	if (element.tabIndex < 0) return false
	return isVisible(element)
}

const walk = (node: Node, into: HTMLElement[]) => {
	if (node instanceof HTMLSlotElement) {
		for (const assigned of node.assignedNodes({ flatten: true })) walk(assigned, into)
		return
	}
	if (node instanceof HTMLElement) {
		if (isTabbable(node)) into.push(node)
		if (node.shadowRoot) {
			for (const child of node.shadowRoot.childNodes) walk(child, into)
			return
		}
	}
	for (const child of node.childNodes) walk(child, into)
}

export const getTabbables = (root: Node): HTMLElement[] => {
	const found: HTMLElement[] = []
	walk(root, found)
	return found
}

/** The focused element, descending through open shadow roots. */
export const getDeepActiveElement = (): Element | null => {
	let active = document.activeElement
	while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
	return active
}
