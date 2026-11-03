import { describe, expect, it } from 'vitest'
import { describeFormContract, entriesOf, innerOf, mountForm, settle } from './form-helpers'
import type { FormHostT } from './form-helpers'

const radios = `
	<z-radio value="a">A</z-radio>
	<z-radio value="b">B</z-radio>
	<z-radio value="c" is-disabled>C</z-radio>
`

const firstRadioInput = (host: HTMLElement) => innerOf<HTMLInputElement>(host.querySelector('z-radio')!, 'input')

describeFormContract({
	tag: 'z-radio-group',
	filled: 'value="b"',
	expected: 'b',
	empty: '',
	emptyEntry: null,
	inner: firstRadioInput,
	mutate: (host) => { host.value = 'a' },
	read: (host) => host.value,
	children: radios
})

describe('<z-radio-group> in a form', () => {
	it('is the only participant: the radios themselves submit nothing', async () => {
		const form = await mountForm(`<z-radio-group name="choice" value="a">${radios}</z-radio-group>`)
		expect(entriesOf(form)).toEqual([['choice', 'a']])
		expect(form.querySelectorAll('z-radio')).toHaveLength(3)
	})

	it('adopts a radio seeded with is-checked as its value', async () => {
		const form = await mountForm(`<z-radio-group name="choice"><z-radio value="x" is-checked>X</z-radio><z-radio value="y">Y</z-radio></z-radio-group>`)
		await settle(form)
		expect(entriesOf(form)).toEqual([['choice', 'x']])
	})

	it('submits the radio the user picked', async () => {
		const form = await mountForm(`<z-radio-group name="choice">${radios}</z-radio-group>`)
		const second = form.querySelectorAll('z-radio')[1] as HTMLElement
		innerOf<HTMLInputElement>(second, 'input').click()
		await settle(form)
		expect(entriesOf(form)).toEqual([['choice', 'b']])
	})

	it('re-enables only the radios it disabled', async () => {
		const form = await mountForm(`<fieldset disabled><z-radio-group name="choice">${radios}</z-radio-group></fieldset>`)
		const fieldset = form.querySelector('fieldset')!
		const [a, b, c] = [...form.querySelectorAll<HTMLElement & { isDisabled?: boolean }>('z-radio')]
		await settle(form)
		expect([a.isDisabled, b.isDisabled, c.isDisabled]).toEqual([true, true, true])

		fieldset.disabled = false
		await settle(form)
		expect([a.isDisabled, b.isDisabled, c.isDisabled]).toEqual([false, false, true])
	})

	it('exposes required to assistive technology on the group', async () => {
		const form = await mountForm(`<z-radio-group name="choice" is-required>${radios}</z-radio-group>`)
		const host = form.querySelector<FormHostT>('z-radio-group')!
		expect(host.getAttribute('aria-required')).toBe('true')
		expect(host.getAttribute('role')).toBe('radiogroup')
	})
})
