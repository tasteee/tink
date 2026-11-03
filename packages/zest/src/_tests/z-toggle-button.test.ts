import { describe, expect, it } from 'vitest'
import '../components/z-toggle-button'
import { getShadowRoot, waitForRender } from './test-helpers'

describe('<z-toggle-button>', () => {
	it('toggles its pressed state and emits the next value', async () => {
		const element = document.createElement('z-toggle-button')
		const pressedStates: boolean[] = []
		element.addEventListener('press', (event) => pressedStates.push((event as CustomEvent).detail.pressed))
		document.body.append(element)
		await waitForRender()

		const button = getShadowRoot(element).querySelector('button') as HTMLButtonElement
		button.click()
		await waitForRender()

		expect(element.hasAttribute('is-pressed')).toBe(true)
		expect(button.getAttribute('aria-pressed')).toBe('true')
		expect(pressedStates).toEqual([true])
	})
})
