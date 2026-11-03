import { afterEach, describe, expect, it } from 'vitest'
import { englishStrings, getLocale, setLocale } from '../../shared/locale'
import { innerOf, mount, settle } from './form-helpers'
import type { FormHostT } from './form-helpers'

afterEach(() => setLocale({}))

describe('locale', () => {
	it('starts in English with every key present', () => {
		expect(getLocale()).toEqual(englishStrings)
	})

	it('replaces strings on mounted elements, and keys left out keep their English', async () => {
		const wrapper = await mount('<z-table></z-table><z-alert is-dismissable>Body</z-alert><z-select label="Fruit"></z-select>')
		const table = wrapper.querySelector<HTMLElement & { columns?: unknown; rows?: unknown }>('z-table')!
		table.columns = [{ key: 'a', label: 'A' }]
		table.rows = []
		await settle(wrapper)
		expect(innerOf(table, '.empty').textContent?.trim()).toBe('No data')

		setLocale({ noData: 'Aucune donnée', dismiss: 'Fermer' })
		await settle(wrapper)
		expect(innerOf(table, '.empty').textContent?.trim()).toBe('Aucune donnée')
		expect(innerOf(wrapper.querySelector('z-alert')!, 'button.close').getAttribute('aria-label')).toBe('Fermer')
		expect(innerOf(wrapper.querySelector('z-select')!, '.value').textContent?.trim()).toBe('Select…')
	})

	it('localises the validation messages zest writes itself, with placeholders filled', async () => {
		setLocale({ selectOneOfTheseOptions: 'Choisissez une option.', valueAtMost: 'Au plus {max}.' })
		const wrapper = await mount('<form><z-radio-group name="p" is-required><z-radio value="a">A</z-radio></z-radio-group><z-number-input name="n" max="5" value="9"></z-number-input></form>')
		await settle(wrapper)
		expect(wrapper.querySelector<FormHostT>('z-radio-group')!.validationMessage).toBe('Choisissez une option.')
		expect(wrapper.querySelector<FormHostT>('z-number-input')!.validationMessage).toBe('Au plus 5.')
	})
})
