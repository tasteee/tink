import { describe, expect, it } from 'vitest'
import './test-helpers'
import '../components/z-checkbox'
import { getShadowRoot, waitForRender } from './test-helpers'

describe('<z-checkbox>', () => {
	it('reflects a checked native checkbox and emits its value on change', async () => {
		const element = document.createElement('z-checkbox')
		element.setAttribute('value', 'terms')
		const changes: Array<{ checked: boolean; value?: string }> = []
		element.addEventListener('change', (event) => changes.push((event as CustomEvent).detail))
		document.body.append(element)
		await waitForRender()

		const input = getShadowRoot(element).querySelector('input') as HTMLInputElement
		input.click()
		await waitForRender()

		expect(element.hasAttribute('is-checked')).toBe(true)
		expect(changes).toEqual([{ checked: true, value: 'terms' }])
	})

	it('disables its native input', async () => {
		const element = document.createElement('z-checkbox')
		element.setAttribute('is-disabled', '')
		document.body.append(element)
		await waitForRender()

		expect((getShadowRoot(element).querySelector('input') as HTMLInputElement).disabled).toBe(true)
	})
})
