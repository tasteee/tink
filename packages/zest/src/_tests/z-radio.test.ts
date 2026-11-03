import { describe, expect, it } from 'vitest'
import '../components/z-radio'
import { getShadowRoot, waitForRender } from './test-helpers'

describe('<z-radio>', () => {
	it('selects itself and emits its value', async () => {
		const element = document.createElement('z-radio')
		element.setAttribute('value', 'starter')
		const selections: string[] = []
		element.addEventListener('select', (event) => selections.push((event as CustomEvent).detail.value))
		document.body.append(element)
		await waitForRender()

		const input = getShadowRoot(element).querySelector('input') as HTMLInputElement
		input.click()
		await waitForRender()

		expect(element.hasAttribute('is-checked')).toBe(true)
		expect(selections).toEqual(['starter'])
	})
})
