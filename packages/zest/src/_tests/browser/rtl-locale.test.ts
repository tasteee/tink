import { afterEach, describe, expect, it } from 'vitest'
import { setLocale } from '../../shared/locale'
import { toaster } from '../../components/z-toaster'
import { innerOf, mount, settle } from './form-helpers'
import { expectNoA11yViolations } from './a11y-helpers'

afterEach(() => { setLocale({}); toaster.clear() })

/*
 * Phase 5's exit criterion, as a test: a settings screen renders in a
 * right-to-left context with a non-English locale, lays out mirrored, and
 * nothing in the library reaches out to Google for fonts.
 */
describe('a settings screen in RTL with a French locale', () => {
	const screen = `
		<div dir="rtl" style="width: 420px">
			<z-tabs label="Paramètres" value="general"></z-tabs>
			<form style="display: grid; gap: 12px">
				<z-field label="Nom d'affichage" description="Visible pour tous"><z-input name="name" value="Ada"></z-input></z-field>
				<z-field label="Langue"><z-select name="lang" is-required></z-select></z-field>
				<z-switch name="dark">Thème sombre</z-switch>
				<z-radio-group name="plan" label="Offre" value="pro"><z-radio value="free">Gratuit</z-radio><z-radio value="pro">Pro</z-radio></z-radio-group>
				<z-table id="table"></z-table>
				<z-button type="submit" tone="primary">Enregistrer</z-button>
			</form>
			<z-toaster id="toast" position="bottom-end"></z-toaster>
		</div>`

	it('lays out mirrored, speaks the locale, and requests no fonts', async () => {
		setLocale({ selectPlaceholder: 'Choisir…', noData: 'Aucune donnée', dismissNotification: 'Fermer', selectAnItemInTheList: 'Veuillez choisir une option.' })
		const wrapper = await mount(screen)
		const tabs = wrapper.querySelector<HTMLElement & { tabs?: unknown }>('z-tabs')!
		tabs.tabs = [{ value: 'general', label: 'Général' }, { value: 'security', label: 'Sécurité' }]
		const select = wrapper.querySelector<HTMLElement & { options?: unknown; validationMessage?: string }>('z-select')!
		select.options = [{ value: 'fr', label: 'Français' }, { value: 'ar', label: 'العربية' }]
		const table = wrapper.querySelector<HTMLElement & { columns?: unknown; rows?: unknown }>('#table')!
		table.columns = [{ key: 'k', label: 'Clé' }]
		table.rows = []
		const toast = wrapper.querySelector<HTMLElement>('#toast')!
		toaster.show({ title: 'Enregistré', duration: 0 })
		await settle(wrapper)

		// Locale reached the strings zest writes itself.
		expect(innerOf(select, '.value').textContent?.trim()).toBe('Choisir…')
		expect(select.validationMessage).toBe('Veuillez choisir une option.')
		expect(innerOf(table, '.empty').textContent?.trim()).toBe('Aucune donnée')
		expect(innerOf(toast, 'button.close').getAttribute('aria-label')).toBe('Fermer')

		// Mirrored: the first tab sits on the right, the toast stack on the left,
		// and the switch's track is on the right of its label.
		const [firstTab, secondTab] = [...tabs.shadowRoot!.querySelectorAll<HTMLElement>('[role="tab"]')]
		expect(firstTab.getBoundingClientRect().left).toBeGreaterThan(secondTab.getBoundingClientRect().left)
		const toastBox = innerOf(toast, '.toast').getBoundingClientRect()
		expect(toastBox.left).toBeLessThan(window.innerWidth / 2)
		const track = innerOf(wrapper.querySelector('z-switch')!, '.track').getBoundingClientRect()
		const switchBox = wrapper.querySelector('z-switch')!.getBoundingClientRect()
		expect(track.left).toBeGreaterThan(switchBox.left + switchBox.width / 2)

		// Arrow keys follow reading direction: ArrowLeft goes to the next tab.
		firstTab.focus()
		firstTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true }))
		await settle(wrapper)
		expect((tabs as HTMLElement & { value?: string }).value).toBe('security')

		await expectNoA11yViolations(wrapper)

		// The library made no font request of its own.
		const fontRequests = performance.getEntriesByType('resource').filter((entry) => /fonts\.g(oogleapis|static)\.com/.test(entry.name))
		expect(fontRequests).toEqual([])
	})
})
