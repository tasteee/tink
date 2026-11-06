import { afterAll, afterEach, describe, expect, it } from 'vitest'
import { getThemePreference, setThemePreference } from '../../shared/theme'
import { innerOf, mount } from './form-helpers'
import { expectNoA11yViolations } from './a11y-helpers'

/*
 * Roles and names an element must expose, found by auditing the docs examples
 * with axe. Each test is the shape of a bug that audit turned up.
 */

type HostT = HTMLElement & Record<string, any>

afterEach(() => {
	document.body.replaceChildren()
})

afterAll(() => setThemePreference('dark'))

// A theme change fades over about 0.55s; axe must not sample colours mid-fade.
const useTheme = async (theme: 'dark' | 'light'): Promise<void> => {
	if (getThemePreference() === theme) return
	setThemePreference(theme)
	await new Promise<void>((resolve) => setTimeout(resolve, 800))
}

describe('<z-collapsible>', () => {
	it('names its content region by its trigger, so several regions stay distinct', async () => {
		const wrapper = await mount('<z-accordion><z-collapsible label="First">One</z-collapsible><z-collapsible label="Second">Two</z-collapsible></z-accordion>')
		const sections = [...wrapper.querySelectorAll<HostT>('z-collapsible')]
		for (const section of sections) {
			const region = innerOf(section, '[role="region"]')
			const triggerId = region.getAttribute('aria-labelledby')
			const trigger = triggerId ? section.shadowRoot!.getElementById(triggerId) : null
			expect(trigger?.tagName).toBe('BUTTON')
		}
		await expectNoA11yViolations(wrapper)
	})
})

describe('<z-avatar>', () => {
	it('a named avatar is an image with that name; an unnamed one has neither', async () => {
		const wrapper = await mount('<z-avatar name="Ada Lovelace"></z-avatar><z-avatar></z-avatar>')
		const [named, unnamed] = [...wrapper.querySelectorAll<HostT>('z-avatar')]
		const namedMark = innerOf(named, '.avatar')
		expect(namedMark.getAttribute('role')).toBe('img')
		expect(namedMark.getAttribute('aria-label')).toBe('Ada Lovelace')
		const unnamedMark = innerOf(unnamed, '.avatar')
		expect(unnamedMark.hasAttribute('role')).toBe(false)
		expect(unnamedMark.hasAttribute('aria-label')).toBe(false)
		await expectNoA11yViolations(wrapper)
	})
})

describe('<z-pagination>', () => {
	it('label names the navigation; without it the localised default is used', async () => {
		const wrapper = await mount('<z-pagination label="Search results" page="1" total="5"></z-pagination><z-pagination page="1" total="5"></z-pagination>')
		const [labelled, plain] = [...wrapper.querySelectorAll<HostT>('z-pagination')]
		expect(innerOf(labelled, 'nav').getAttribute('aria-label')).toBe('Search results')
		expect(innerOf(plain, 'nav').getAttribute('aria-label')).toBe('Pagination')
	})

	it('two paginations with different labels are distinct landmarks', async () => {
		const wrapper = await mount('<z-pagination label="Search results" page="1" total="5"></z-pagination><z-pagination label="Archive" page="2" total="9"></z-pagination>')
		await expectNoA11yViolations(wrapper)
	})
})

describe.each(['dark', 'light'] as const)('<z-avatar> initials contrast, %s theme', (theme) => {
	it('every tone is readable', async () => {
		await useTheme(theme)
		const tones = ['neutral', 'primary', 'secondary', 'success', 'warning', 'danger']
		const markup = tones.map((tone) => `<z-avatar name="Ada Lovelace" tone="${tone}"></z-avatar>`).join('')
		const wrapper = await mount(markup)
		await expectNoA11yViolations(wrapper)
	})
})
