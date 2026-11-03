import { describe, expect, it } from 'vitest'
import { entriesOf, innerOf, mountForm, settle } from './form-helpers'

/*
 * z-button carries no value of its own, so it does not run the shared
 * contract. What it must do is reach the form from inside its shadow root.
 */
describe('<z-button> in a form', () => {
	it('type="submit" submits the owning form and runs validation first', async () => {
		const form = await mountForm('<z-input name="q" is-required></z-input><z-button type="submit">Go</z-button>')
		const button = innerOf<HTMLButtonElement>(form.querySelector('z-button')!, 'button')
		let submitted = 0
		form.addEventListener('submit', (event) => { event.preventDefault(); submitted += 1 })

		button.click()
		expect(submitted).toBe(0)

		const host = form.querySelector('z-input') as HTMLElement & { value?: string }
		host.value = 'zest'
		await settle(form)
		button.click()
		expect(submitted).toBe(1)
	})

	it('a named submit button contributes its value for the submission only', async () => {
		const form = await mountForm('<z-input name="q" value="x"></z-input><z-button type="submit" name="action" value="save">Save</z-button>')
		let seen: Array<[string, FormDataEntryValue]> = []
		form.addEventListener('submit', (event) => { event.preventDefault(); seen = entriesOf(form) })

		expect(entriesOf(form)).toEqual([['q', 'x']])
		innerOf<HTMLButtonElement>(form.querySelector('z-button')!, 'button').click()
		expect(seen).toEqual([['q', 'x'], ['action', 'save']])
		expect(entriesOf(form)).toEqual([['q', 'x']])
	})

	it('type="reset" resets the owning form', async () => {
		const form = await mountForm('<z-input name="q" value="start"></z-input><z-button type="reset">Clear</z-button>')
		const host = form.querySelector('z-input') as HTMLElement & { value?: string }
		host.value = 'edited'
		await settle(form)
		expect(entriesOf(form)).toEqual([['q', 'edited']])

		innerOf<HTMLButtonElement>(form.querySelector('z-button')!, 'button').click()
		await settle(form)
		expect(entriesOf(form)).toEqual([['q', 'start']])
	})

	it('a plain button does nothing to the form', async () => {
		const form = await mountForm('<z-input name="q" value="start"></z-input><z-button>Noop</z-button>')
		let submitted = 0
		form.addEventListener('submit', (event) => { event.preventDefault(); submitted += 1 })
		innerOf<HTMLButtonElement>(form.querySelector('z-button')!, 'button').click()
		expect(submitted).toBe(0)
	})

	it('follows a disabled fieldset', async () => {
		const form = await mountForm('<fieldset disabled><z-button type="submit">Go</z-button></fieldset>')
		const button = innerOf<HTMLButtonElement>(form.querySelector('z-button')!, 'button')
		await settle(form)
		expect(button.disabled).toBe(true)
	})
})
