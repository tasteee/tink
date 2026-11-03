import { describe, expect, it } from 'vitest'
import { describeFormContract, entriesOf, innerOf, mountForm, settle } from './form-helpers'
import type { FormHostT } from './form-helpers'

describeFormContract({
	tag: 'z-number-input',
	filled: 'value="42"',
	expected: '42',
	empty: '',
	emptyEntry: '',
	inner: 'input',
	mutate: (host) => { host.value = 7 },
	read: (host) => host.value
})

describe('<z-number-input> in a form', () => {
	const type = async (host: HTMLElement, text: string) => {
		const input = innerOf<HTMLInputElement>(host, 'input')
		input.focus()
		input.value = text
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
		await settle(host.getRootNode() as ParentNode)
	}

	it('reports rangeUnderflow and rangeOverflow against min and max', async () => {
		const form = await mountForm('<z-number-input name="qty" min="1" max="5" value="3"></z-number-input>')
		const host = form.querySelector<FormHostT>('z-number-input')!
		expect(host.validity.valid).toBe(true)

		await type(host, '0')
		expect(host.validity.rangeUnderflow).toBe(true)
		expect(host.validationMessage).toContain('1')
		expect(form.checkValidity()).toBe(false)

		await type(host, '9')
		expect(host.validity.rangeOverflow).toBe(true)
		expect(host.validationMessage).toContain('5')

		await type(host, '4')
		expect(host.validity.valid).toBe(true)
		expect(form.checkValidity()).toBe(true)
	})

	it('reports stepMismatch from min in the given step', async () => {
		const form = await mountForm('<z-number-input name="qty" min="0.5" step="0.25" value="1"></z-number-input>')
		const host = form.querySelector<FormHostT>('z-number-input')!
		expect(host.validity.valid).toBe(true)

		await type(host, '1.1')
		expect(host.validity.stepMismatch).toBe(true)
		expect(host.validationMessage).toContain('1')
		expect(host.validationMessage).toContain('1.25')
	})

	it('reports badInput for text that is not a number and submits an empty entry', async () => {
		const form = await mountForm('<z-number-input name="qty" value="2"></z-number-input>')
		const host = form.querySelector<FormHostT>('z-number-input')!
		await type(host, '2x')
		expect(host.validity.badInput).toBe(true)
		expect(form.checkValidity()).toBe(false)
		expect(entriesOf(form)).toEqual([['qty', '']])
	})

	it('submits the owning form on Enter', async () => {
		const form = await mountForm('<z-number-input name="qty" value="2"></z-number-input>')
		const host = form.querySelector<FormHostT>('z-number-input')!
		let submitted = 0
		form.addEventListener('submit', (event) => { event.preventDefault(); submitted += 1 })
		innerOf<HTMLInputElement>(host, 'input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }))
		expect(submitted).toBe(1)
	})
})
