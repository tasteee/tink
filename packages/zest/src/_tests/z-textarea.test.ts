import { describe, expect, it } from 'vitest'
import '../components/z-textarea'
import { getShadowRoot, waitForRender } from './test-helpers'

describe('<z-textarea>', () => {
	it('reflects typed multiline text and emits input and change values', async () => {
		const element = document.createElement('z-textarea')
		const inputValues: string[] = []
		const changeValues: string[] = []
		element.addEventListener('input', (event) => {
			const detail = (event as CustomEvent<{ value?: string }>).detail
			if (detail?.value) inputValues.push(detail.value)
		})
		element.addEventListener('change', (event) => {
			const detail = (event as CustomEvent<{ value?: string }>).detail
			if (detail?.value) changeValues.push(detail.value)
		})
		document.body.append(element)
		await waitForRender()

		const textarea = getShadowRoot(element).querySelector('textarea') as HTMLTextAreaElement
		textarea.value = 'Line one\nLine two'
		textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
		await waitForRender()
		textarea.dispatchEvent(new Event('blur', { bubbles: true, composed: true }))
		await waitForRender()

		expect(element.getAttribute('value')).toBe('Line one\nLine two')
		expect(inputValues).toEqual(['Line one\nLine two'])
		expect(changeValues).toEqual(['Line one\nLine two'])
	})

	it('marks auto-resizing fields and propagates row count', async () => {
		const element = document.createElement('z-textarea')
		element.setAttribute('is-auto-resize', '')
		element.setAttribute('rows', '6')
		document.body.append(element)
		await waitForRender()

		const textarea = getShadowRoot(element).querySelector('textarea') as HTMLTextAreaElement
		expect(textarea.className).toBe('is-auto-resize')
		expect(textarea.getAttribute('rows')).toBe('6')
	})
})
