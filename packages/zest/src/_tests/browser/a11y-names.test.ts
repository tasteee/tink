import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { innerOf, mount, settle } from './form-helpers'
import { expectNoA11yViolations } from './a11y-helpers'

/*
 * The naming and description rule from src/shared/accessible.tsx, checked
 * the way a screen reader would see it: by accessible name and description
 * on the role-bearing element inside the shadow root. `page.getByRole`
 * resolves names through the accessibility tree, across shadow roots.
 */

const controls: Array<{ tag: string; role: string; inner: string }> = [
	{ tag: 'z-input', role: 'textbox', inner: 'input' },
	{ tag: 'z-textarea', role: 'textbox', inner: 'textarea' },
	{ tag: 'z-number-input', role: 'spinbutton', inner: 'input' },
	{ tag: 'z-checkbox', role: 'checkbox', inner: 'input' },
	{ tag: 'z-switch', role: 'switch', inner: 'input' },
	{ tag: 'z-select', role: 'combobox', inner: 'button.trigger' },
	{ tag: 'z-combobox', role: 'combobox', inner: 'input' }
]

const describedText = (host: HTMLElement, inner: string): string => {
	const control = innerOf(host, inner)
	const ids = (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
	return ids.map((id) => host.shadowRoot!.getElementById(id)?.textContent?.trim() ?? '').join(' ')
}

describe.each(controls)('<$tag> accessible name', ({ tag, role, inner }) => {
	it('comes from aria-labelledby on the host first', async () => {
		const wrapper = await mount(`<span id="heading">Shipping address</span><${tag} aria-label="Ignored" label="Ignored too" aria-labelledby="heading"></${tag}>`)
		await expect.element(page.getByRole(role, { name: 'Shipping address' })).toBeInTheDocument()
		expect(innerOf(wrapper.querySelector(tag)!, inner).getAttribute('aria-label')).toBe('Shipping address')
	})

	it('then from aria-label on the host', async () => {
		await mount(`<${tag} aria-label="Search" label="Ignored"></${tag}>`)
		await expect.element(page.getByRole(role, { name: 'Search' })).toBeInTheDocument()
	})

	it('then from the label property', async () => {
		await mount(`<${tag} label="Quantity"></${tag}>`)
		await expect.element(page.getByRole(role, { name: 'Quantity' })).toBeInTheDocument()
	})

	it('and from a surrounding z-field, which forwards its label', async () => {
		await mount(`<z-field label="Email address"><${tag}></${tag}></z-field>`)
		await expect.element(page.getByRole(role, { name: 'Email address' })).toBeInTheDocument()
	})

	it('and last from a <label for> pointing at the host', async () => {
		await mount(`<label for="the-${tag}">Postcode</label><${tag} id="the-${tag}"></${tag}>`)
		await expect.element(page.getByRole(role, { name: 'Postcode' })).toBeInTheDocument()
	})

	it('follows a host aria-label that changes after mount', async () => {
		const wrapper = await mount(`<${tag} aria-label="Before"></${tag}>`)
		const host = wrapper.querySelector<HTMLElement>(tag)!
		host.setAttribute('aria-label', 'After')
		await settle(wrapper)
		await expect.element(page.getByRole(role, { name: 'After' })).toBeInTheDocument()
	})
})

describe.each(controls)('<$tag> accessible description', ({ tag, inner }) => {
	it('takes the z-field description through aria-describedby inside its own shadow root', async () => {
		const wrapper = await mount(`<z-field label="Name" description="As it appears on your card"><${tag}></${tag}></z-field>`)
		const host = wrapper.querySelector<HTMLElement>(tag)!
		expect(describedText(host, inner)).toBe('As it appears on your card')
		await expectNoA11yViolations(wrapper)
	})

	it('takes the z-field error, flags aria-invalid, and clears both when the error goes', async () => {
		const wrapper = await mount(`<z-field label="Name" description="Help"><${tag}></${tag}></z-field>`)
		const field = wrapper.querySelector<HTMLElement & { error?: string }>('z-field')!
		const host = wrapper.querySelector<HTMLElement>(tag)!

		field.error = 'Name is required'
		await settle(wrapper)
		expect(describedText(host, inner)).toContain('Name is required')
		expect(innerOf(host, inner).getAttribute('aria-invalid')).toBe('true')
		await expectNoA11yViolations(wrapper)

		field.error = ''
		await settle(wrapper)
		expect(describedText(host, inner)).toBe('Help')
		expect(innerOf(host, inner).getAttribute('aria-invalid')).toBeNull()
	})

	it('keeps a description the control was given directly', async () => {
		const wrapper = await mount(`<z-field label="Name" description="From the field"><${tag} description="Its own"></${tag}></z-field>`)
		expect(describedText(wrapper.querySelector(tag)!, inner)).toBe('Its own')
	})
})

describe('<z-radio-group> naming and description', () => {
	it('is a named radiogroup whose description rides on aria-description', async () => {
		const wrapper = await mount(`<z-field label="Plan" description="Change any time"><z-radio-group><z-radio value="a">A</z-radio></z-radio-group></z-field>`)
		const group = wrapper.querySelector<HTMLElement>('z-radio-group')!
		await expect.element(page.getByRole('radiogroup', { name: 'Plan' })).toBeInTheDocument()
		expect(group.getAttribute('aria-description')).toBe('Change any time')
		await expectNoA11yViolations(wrapper)
	})
})

describe('<z-tooltip> description', () => {
	it('forwards its content as aria-description on the trigger, and releases it when the content goes', async () => {
		const wrapper = await mount(`<z-tooltip content="Saves your draft"><z-button>Save</z-button></z-tooltip>`)
		const tooltip = wrapper.querySelector<HTMLElement & { content?: string }>('z-tooltip')!
		const button = wrapper.querySelector<HTMLElement>('z-button')!
		expect(button.getAttribute('aria-description')).toBe('Saves your draft')

		tooltip.content = ''
		await settle(wrapper)
		expect(button.getAttribute('aria-description')).toBeNull()
	})

	it('leaves an aria-description the trigger already had', async () => {
		const wrapper = await mount(`<z-tooltip content="Tooltip text"><z-button aria-description="Theirs">Save</z-button></z-tooltip>`)
		expect(wrapper.querySelector('z-button')!.getAttribute('aria-description')).toBe('Theirs')
	})
})

describe('icon-only buttons', () => {
	it.each(['z-button', 'z-toggle-button'])('<%s> takes its name from aria-label on the host', async (tag) => {
		const wrapper = await mount(`<${tag} aria-label="Align left"><svg width="12" height="12" aria-hidden="true"></svg></${tag}>`)
		await expect.element(page.getByRole('button', { name: 'Align left' })).toBeInTheDocument()
		await expectNoA11yViolations(wrapper)
	})

	it('<z-button> keeps its visible text as its name when the host has no aria-label', async () => {
		await mount('<z-button>Save draft</z-button>')
		await expect.element(page.getByRole('button', { name: 'Save draft' })).toBeInTheDocument()
	})
})
