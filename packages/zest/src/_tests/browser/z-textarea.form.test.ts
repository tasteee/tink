import { describe, expect, it } from 'vitest'
import { describeFormContract, entriesOf, innerOf, mountForm, settle } from './form-helpers'
import type { FormHostT } from './form-helpers'

describeFormContract({
	tag: 'z-textarea',
	filled: 'value="Several lines"',
	expected: 'Several lines',
	empty: '',
	emptyEntry: '',
	inner: 'textarea',
	mutate: (host) => { host.value = 'changed' },
	read: (host) => host.value
})

describe('<z-textarea> in a form', () => {
	it('submits what the user typed, newlines included', async () => {
		const form = await mountForm('<z-textarea name="notes"></z-textarea>')
		const host = form.querySelector<FormHostT>('z-textarea')!
		const textarea = innerOf<HTMLTextAreaElement>(host, 'textarea')
		textarea.value = 'line one\nline two'
		textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
		await settle(form)
		expect(entriesOf(form)).toEqual([['notes', 'line one\nline two']])
	})

	it('does not submit the form on Enter', async () => {
		const form = await mountForm('<z-textarea name="notes"></z-textarea>')
		const host = form.querySelector<FormHostT>('z-textarea')!
		let submitted = 0
		form.addEventListener('submit', (event) => { event.preventDefault(); submitted += 1 })
		innerOf<HTMLTextAreaElement>(host, 'textarea').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }))
		expect(submitted).toBe(0)
	})
})
