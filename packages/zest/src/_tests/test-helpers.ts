import { afterEach } from 'vitest'

export const waitForRender = async () => {
	await Promise.resolve()
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

export const getShadowRoot = <ElementType extends HTMLElement>(element: ElementType) => {
	if (!element.shadowRoot) throw new Error(`Expected ${element.tagName.toLowerCase()} to render a shadow root`)
	return element.shadowRoot
}

afterEach(() => {
	document.body.replaceChildren()
})
