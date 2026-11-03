import { describe, expect, it } from 'vitest'
import { describeFormContract, entriesOf, innerOf, mountForm, settle, trySubmit } from './form-helpers'
import type { FormHostT } from './form-helpers'

describeFormContract({
	tag: 'z-input',
	filled: 'value="Zest"',
	expected: 'Zest',
	empty: '',
	emptyEntry: '',
	inner: 'input',
	mutate: (host) => { host.value = 'changed' },
	read: (host) => host.value
})

describe('<z-input> in a form', () => {
	const type = async (host: HTMLElement, text: string) => {
		const input = innerOf<HTMLInputElement>(host, 'input')
		input.focus()
		input.value = text
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
		await settle(host.getRootNode() as ParentNode)
	}

	it('submits what the user typed', async () => {
		const form = await mountForm('<z-input name="email"></z-input>')
		const host = form.querySelector<FormHostT>('z-input')!
		await type(host, 'hi@zest.dev')
		expect(entriesOf(form)).toEqual([['email', 'hi@zest.dev']])
	})

	it('mirrors the inner input type validation onto the host', async () => {
		const form = await mountForm('<z-input name="email" type="email" value="not-an-email"></z-input>')
		const host = form.querySelector<FormHostT>('z-input')!
		expect(host.validity.typeMismatch).toBe(true)
		expect(form.checkValidity()).toBe(false)

		await type(host, 'hi@zest.dev')
		expect(host.validity.valid).toBe(true)
		expect(form.checkValidity()).toBe(true)
	})

	it('submits the owning form on Enter, running validation first', async () => {
		const form = await mountForm('<z-input name="q" is-required></z-input>')
		const host = form.querySelector<FormHostT>('z-input')!
		const input = innerOf<HTMLInputElement>(host, 'input')
		let submitted = 0
		form.addEventListener('submit', (event) => { event.preventDefault(); submitted += 1 })

		input.focus()
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }))
		expect(submitted).toBe(0)

		await type(host, 'zest')
		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }))
		expect(submitted).toBe(1)
	})

	it('is not validated while readonly, as a native input is not', async () => {
		const form = await mountForm('<z-input name="q" is-required is-readonly></z-input>')
		expect(form.checkValidity()).toBe(true)
		expect(trySubmit(form)).toBe(true)
		expect(entriesOf(form)).toEqual([['q', '']])
	})
})
