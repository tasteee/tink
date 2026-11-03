import { describe, expect, it } from 'vitest'
import { describeFormContract, entriesOf, innerOf, mountForm, settle } from './form-helpers'
import type { FormHostT } from './form-helpers'

describeFormContract({
	tag: 'z-switch',
	filled: 'value="enabled" is-checked',
	expected: 'enabled',
	empty: 'value="enabled"',
	emptyEntry: null,
	inner: 'input',
	mutate: (host) => { host.isChecked = false },
	read: (host) => host.isChecked
})

describe('<z-switch> in a form', () => {
	it('submits "on" when on without a value', async () => {
		const form = await mountForm('<z-switch name="dark" is-checked></z-switch>')
		expect(entriesOf(form)).toEqual([['dark', 'on']])
	})

	it('follows a toggle into and out of the FormData', async () => {
		const form = await mountForm('<z-switch name="dark"></z-switch>')
		const host = form.querySelector<FormHostT>('z-switch')!
		innerOf<HTMLInputElement>(host, 'input').click()
		await settle(form)
		expect(entriesOf(form)).toEqual([['dark', 'on']])

		host.click()
		await settle(form)
		expect(entriesOf(form)).toEqual([])
	})
})
