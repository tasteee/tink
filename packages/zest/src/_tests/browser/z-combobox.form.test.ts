import { describe, expect, it } from 'vitest'
import { describeFormContract, entriesOf, innerOf, mountForm, settle } from './form-helpers'
import type { FormHostT } from './form-helpers'

type ComboboxHostT = FormHostT & { options?: Array<{ value: string; label: string; isDisabled?: boolean }> }

const options = [
	{ value: 'a', label: 'Apple' },
	{ value: 'b', label: 'Banana' },
	{ value: 'c', label: 'Cherry', isDisabled: true }
]

describeFormContract({
	tag: 'z-combobox',
	filled: 'value="b"',
	expected: 'b',
	empty: '',
	emptyEntry: '',
	inner: 'input',
	mutate: (host) => { host.value = 'a' },
	read: (host) => host.value
})

describe('<z-combobox> in a form', () => {
	it('submits the chosen option value, not the search text', async () => {
		const form = await mountForm('<z-combobox name="fruit"></z-combobox>')
		const host = form.querySelector<ComboboxHostT>('z-combobox')!
		host.options = options
		await settle(form)

		const input = innerOf<HTMLInputElement>(host, 'input')
		input.focus()
		input.value = 'ban'
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
		await settle(form)
		expect(entriesOf(form)).toEqual([['fruit', '']])

		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }))
		await settle(form)
		expect(entriesOf(form)).toEqual([['fruit', 'b']])
	})

	it('is required against the selection, so typing alone does not satisfy it', async () => {
		const form = await mountForm('<z-combobox name="fruit" is-required></z-combobox>')
		const host = form.querySelector<ComboboxHostT>('z-combobox')!
		host.options = options
		await settle(form)

		const input = innerOf<HTMLInputElement>(host, 'input')
		input.focus()
		input.value = 'app'
		input.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
		await settle(form)
		expect(host.validity.valueMissing).toBe(true)
		expect(input.getAttribute('aria-required')).toBe('true')

		input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }))
		await settle(form)
		expect(host.validity.valid).toBe(true)
		expect(entriesOf(form)).toEqual([['fruit', 'a']])
	})
})
