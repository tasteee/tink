import { describe, expect, it } from 'vitest'
import './test-helpers'
import '../components/z-button'
import { getShadowRoot, waitForRender } from './test-helpers'

describe('<z-button>', () => {
	it('renders a native button with its slotted label', async () => {
		const element = document.createElement('z-button')
		element.textContent = 'Save'
		document.body.append(element)
		await waitForRender()

		const button = getShadowRoot(element).querySelector('button')
		const slot = button?.querySelector('slot')
		expect(slot?.assignedNodes().map((node) => node.textContent).join('')).toBe('Save')
		expect(button?.type).toBe('button')
	})

	it('forwards disabled state to the native button', async () => {
		const element = document.createElement('z-button')
		element.setAttribute('is-disabled', '')
		document.body.append(element)
		await waitForRender()

		expect(getShadowRoot(element).querySelector('button')?.disabled).toBe(true)
	})
})
