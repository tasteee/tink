import { describe, expect, it } from 'vitest'
import './test-helpers'
import '../components/z-switch'
import { getShadowRoot, waitForRender } from './test-helpers'

describe('<z-switch>', () => {
	it('toggles checked state and emits a composed change event', async () => {
		const element = document.createElement('z-switch')
		const changes: Array<{ checked: boolean }> = []
		element.addEventListener('change', (event) => changes.push((event as CustomEvent).detail))
		document.body.append(element)
		await waitForRender()

		element.click()
		await waitForRender()

		expect(element.hasAttribute('is-checked')).toBe(true)
		expect(changes).toEqual([{ checked: true, value: undefined }])
	})

	it('keeps a disabled switch unchanged', async () => {
		const element = document.createElement('z-switch')
		element.setAttribute('is-disabled', '')
		document.body.append(element)
		await waitForRender()

		element.click()
		await waitForRender()

		expect(element.hasAttribute('is-checked')).toBe(false)
		expect((getShadowRoot(element).querySelector('input') as HTMLInputElement).disabled).toBe(true)
	})
})
