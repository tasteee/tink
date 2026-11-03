import { describe, expect, it } from 'vitest'
import { describeFormContract, entriesOf, innerOf, mountForm, settle } from './form-helpers'
import type { FormHostT } from './form-helpers'

describeFormContract({
	tag: 'z-checkbox',
	filled: 'value="yes" is-checked',
	expected: 'yes',
	empty: 'value="yes"',
	emptyEntry: null,
	inner: 'input',
	mutate: (host) => { host.isChecked = false },
	read: (host) => host.isChecked
})

describe('<z-checkbox> in a form', () => {
	it('submits the platform default "on" when checked without a value', async () => {
		const form = await mountForm('<z-checkbox name="agree" is-checked></z-checkbox>')
		expect(entriesOf(form)).toEqual([['agree', 'on']])
	})

	it('follows a user click into and out of the FormData', async () => {
		const form = await mountForm('<z-checkbox name="agree" value="yes"></z-checkbox>')
		const host = form.querySelector<FormHostT>('z-checkbox')!
		const input = innerOf<HTMLInputElement>(host, 'input')

		input.click()
		await settle(form)
		expect(entriesOf(form)).toEqual([['agree', 'yes']])

		input.click()
		await settle(form)
		expect(entriesOf(form)).toEqual([])
	})

	it('lets several checkboxes share a name', async () => {
		const form = await mountForm(`
			<z-checkbox name="topping" value="olives" is-checked></z-checkbox>
			<z-checkbox name="topping" value="basil"></z-checkbox>
			<z-checkbox name="topping" value="chili" is-checked></z-checkbox>
		`)
		expect(entriesOf(form)).toEqual([['topping', 'olives'], ['topping', 'chili']])
	})
})
