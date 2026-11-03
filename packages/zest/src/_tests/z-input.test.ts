import { describe, expect, it } from 'vitest'
import '../components/z-input'
import { getShadowRoot, waitForRender } from './test-helpers'

describe('<z-input>', () => {
	it('reflects typed text and emits input and change values', async () => {
		const element = document.createElement('z-input')
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

		const input = getShadowRoot(element).querySelector('input') as HTMLInputElement
		input.value = 'Zest'
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
		await waitForRender()
		input.dispatchEvent(new Event('blur', { bubbles: true, composed: true }))
		await waitForRender()

		expect(element.getAttribute('value')).toBe('Zest')
		expect(inputValues).toEqual(['Zest'])
		expect(changeValues).toEqual(['Zest'])
	})

	it('forwards required, readonly, disabled, and accessible label properties', async () => {
		const element = document.createElement('z-input')
		element.setAttribute('label', 'Email')
		element.setAttribute('is-required', '')
		element.setAttribute('is-readonly', '')
		element.setAttribute('is-disabled', '')
		document.body.append(element)
		await waitForRender()

		const input = getShadowRoot(element).querySelector('input') as HTMLInputElement
		expect(input.required).toBe(true)
		expect(input.readOnly).toBe(true)
		expect(input.disabled).toBe(true)
		expect(input.getAttribute('aria-label')).toBe('Email')
	})
})
