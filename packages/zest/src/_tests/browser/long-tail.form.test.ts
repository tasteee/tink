import { describe, expect, it } from 'vitest'
import { describeFormContract, entriesOf, innerOf, mountForm, settle } from './form-helpers'
import type { FormHostT } from './form-helpers'

/*
 * The form-shaped elements outside the core set. z-input-otp is a text-like
 * value and takes the whole contract; the others always have a value, or
 * carry it on children, so they get the parts of it that apply: the entry,
 * reset, and a disabled fieldset.
 */

describeFormContract({
	tag: 'z-input-otp',
	filled: 'value="123456" length="6"',
	expected: '123456',
	empty: 'length="6"',
	emptyEntry: '',
	inner: 'input',
	mutate: (host) => { host.value = '654321' },
	read: (host) => host.value
})

describe('<z-slider> in a form', () => {
	it('submits its value, resets, and follows a disabled fieldset', async () => {
		const form = await mountForm('<fieldset><z-slider name="volume" label="Volume" value="30" min="0" max="100"></z-slider></fieldset>')
		const host = form.querySelector<FormHostT>('z-slider')!
		expect(entriesOf(form)).toEqual([['volume', '30']])

		host.value = 70
		await settle(form)
		expect(entriesOf(form)).toEqual([['volume', '70']])
		form.reset()
		await settle(form)
		expect(entriesOf(form)).toEqual([['volume', '30']])

		form.querySelector('fieldset')!.disabled = true
		await settle(form)
		expect(entriesOf(form)).toEqual([])
		expect(innerOf<HTMLInputElement>(host, 'input').disabled).toBe(true)
	})
})

describe('<z-range> in a form', () => {
	it('submits both handles under one name, and resets both', async () => {
		const form = await mountForm('<z-range name="price" min="0" max="100" value="[20, 80]"></z-range>')
		await settle(form)
		expect(new FormData(form).getAll('price')).toEqual(['20', '80'])

		const lower = innerOf<HTMLInputElement>(form.querySelector('z-range')!, 'input.left')
		lower.value = '35'
		lower.dispatchEvent(new Event('input', { bubbles: true }))
		lower.dispatchEvent(new Event('change', { bubbles: true }))
		await settle(form)
		expect(new FormData(form).getAll('price')).toEqual(['35', '80'])

		form.reset()
		await settle(form)
		expect(new FormData(form).getAll('price')).toEqual(['20', '80'])
	})

	it('takes value and handles as arrays, and never lets the handles cross', async () => {
		const form = await mountForm('<z-range name="price" min="0" max="100"></z-range>')
		const host = form.querySelector<HTMLElement & { value?: number[]; handles?: unknown }>('z-range')!
		host.handles = [{ label: 'Min price', min: 10 }, { label: 'Max price', max: 90 }]
		host.value = [95, 5]
		await settle(form)
		expect(host.value).toEqual([10, 90])
		expect(innerOf<HTMLInputElement>(host, 'input.left').getAttribute('aria-label')).toBe('Min price')
		host.value = [40, 40]
		await settle(form)
		expect(host.value).toEqual([39, 40])
	})
})

describe('<z-color-picker> in a form', () => {
	it('always submits a hex, like a native colour input, and resets', async () => {
		const form = await mountForm('<z-color-picker name="brand" label="Brand" value="#112233"></z-color-picker>')
		const host = form.querySelector<FormHostT & { value?: string }>('z-color-picker')!
		expect(entriesOf(form)).toEqual([['brand', '#112233']])
		host.value = '#445566'
		await settle(form)
		expect(entriesOf(form)).toEqual([['brand', '#445566']])
		form.reset()
		await settle(form)
		expect(entriesOf(form)).toEqual([['brand', '#112233']])
	})
})

describe('<z-filter> in a form', () => {
	it('submits the chosen leaf, nothing while clear, and resets to clear', async () => {
		const form = await mountForm('<z-filter name="topic" label="Topic"></z-filter>')
		const host = form.querySelector<FormHostT & { options?: unknown }>('z-filter')!
		host.options = [{ value: 'design', label: 'Design' }, { value: 'code', label: 'Code' }]
		await settle(form)
		expect(entriesOf(form)).toEqual([])

		const pill = [...host.shadowRoot!.querySelectorAll<HTMLButtonElement>('button')].find((button) => button.textContent?.trim() === 'Code')!
		pill.click()
		await settle(form)
		expect(entriesOf(form)).toEqual([['topic', 'code']])

		form.reset()
		await settle(form)
		expect(entriesOf(form)).toEqual([])
	})
})

describe('<z-toggle-button-group> in a form', () => {
	const items = '<z-toggle-button-group-item value="bold" is-pressed>B</z-toggle-button-group-item><z-toggle-button-group-item value="italic">I</z-toggle-button-group-item>'

	it('single: submits the pressed value and resets to the initial one', async () => {
		const form = await mountForm(`<z-toggle-button-group name="style">${items}</z-toggle-button-group>`)
		await settle(form)
		expect(entriesOf(form)).toEqual([['style', 'bold']])

		innerOf<HTMLButtonElement>(form.querySelectorAll('z-toggle-button-group-item')[1] as HTMLElement, 'button').click()
		await settle(form)
		expect(entriesOf(form)).toEqual([['style', 'italic']])

		form.reset()
		await settle(form)
		expect(entriesOf(form)).toEqual([['style', 'bold']])
	})

	it('multiple: submits every pressed value under the name', async () => {
		const form = await mountForm(`<z-toggle-button-group name="style" is-multiple>${items}</z-toggle-button-group>`)
		await settle(form)
		innerOf<HTMLButtonElement>(form.querySelectorAll('z-toggle-button-group-item')[1] as HTMLElement, 'button').click()
		await settle(form)
		expect(new FormData(form).getAll('style')).toEqual(['bold', 'italic'])
	})
})
