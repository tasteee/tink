import { describe, expect, it } from 'vitest'
import { describeFormContract, entriesOf, innerOf, mountForm, settle } from './form-helpers'
import type { FormHostT } from './form-helpers'

type SelectHostT = FormHostT & { options?: Array<{ value: string; label: string; isDisabled?: boolean }> }

const options = [
	{ value: 'a', label: 'Apple' },
	{ value: 'b', label: 'Banana' },
	{ value: 'c', label: 'Cherry', isDisabled: true }
]

describeFormContract({
	tag: 'z-select',
	filled: 'value="b"',
	expected: 'b',
	empty: '',
	emptyEntry: '',
	inner: 'button.trigger',
	mutate: (host) => { host.value = 'a' },
	read: (host) => host.value
})

describe('<z-select> in a form', () => {
	it('submits the option the user picked', async () => {
		const form = await mountForm('<z-select name="fruit"></z-select>')
		const host = form.querySelector<SelectHostT>('z-select')!
		host.options = options
		await settle(form)

		innerOf<HTMLButtonElement>(host, 'button.trigger').click()
		await settle(form)
		const banana = [...host.shadowRoot!.querySelectorAll<HTMLElement>('[role="option"]')].find((el) => el.textContent?.includes('Banana'))!
		banana.click()
		await settle(form)

		expect(entriesOf(form)).toEqual([['fruit', 'b']])
		expect(host.validity.valid).toBe(true)
	})

	it('marks the trigger required for assistive technology', async () => {
		const form = await mountForm('<z-select name="fruit" is-required></z-select>')
		const host = form.querySelector<SelectHostT>('z-select')!
		expect(innerOf<HTMLButtonElement>(host, 'button.trigger').getAttribute('aria-required')).toBe('true')
	})
})
