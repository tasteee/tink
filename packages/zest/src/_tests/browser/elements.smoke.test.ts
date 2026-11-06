import { afterAll, afterEach, describe, expect, it } from 'vitest'
import '../../index'
import manifest from '../../../custom-elements.json'
import { getThemePreference, setThemePreference } from '../../shared/theme'
import { mount, settle } from './form-helpers'
import { expectNoA11yViolations } from './a11y-helpers'

/*
 * One smoke suite for every public element, driven by custom-elements.json so
 * a new element is covered the day it ships. It does not replace the
 * behaviour tests next to it (forms, keyboard, locale). It is the floor every
 * element stands on:
 *
 *   1. it upgrades, renders and settles without an error;
 *   2. each attribute in the manifest stays in step with its property;
 *   3. it passes axe at rest, in the dark and the light theme;
 *   4. the elements that open pass axe while open.
 */

type ManifestAttributeT = { name: string; fieldName: string; type: { text: string } }
type ManifestDeclarationT = { tagName: string; customElement?: boolean; attributes?: ManifestAttributeT[] }
type ManifestT = { modules: { declarations?: ManifestDeclarationT[] }[] }
type ElementRecordT = HTMLElement & Record<string, unknown>
type AttributeKindT = 'boolean' | 'number' | 'string' | 'enum' | 'other'

const declarations = (manifest as unknown as ManifestT).modules.flatMap((module) => module.declarations ?? [])
const elements = declarations.filter((declaration) => declaration.customElement)
const tags = elements.map((declaration) => declaration.tagName)

const unionPattern = /^\s*('[^']+'\s*\|\s*)*'[^']+'\s*$/

const stripUndefined = (typeText: string): string => typeText.replace(/\s*\|\s*undefined/g, '').trim()

const getAttributeKind = (typeText: string): AttributeKindT => {
	const text = stripUndefined(typeText)
	if (text === 'boolean') return 'boolean'
	if (text === 'number') return 'number'
	if (text === 'string') return 'string'
	if (unionPattern.test(text)) return 'enum'
	return 'other'
}

const getEnumValues = (typeText: string): string[] => {
	const matches = stripUndefined(typeText).matchAll(/'([^']+)'/g)
	return [...matches].map((match) => match[1])
}

// Anything that goes wrong while `work` runs and the page settles: an
// uncaught error, an unhandled rejection, or a console.error.
const collectErrors = async (work: () => Promise<void> | void): Promise<string[]> => {
	const errors: string[] = []
	const onError = (event: ErrorEvent) => errors.push(event.message)
	const onRejection = (event: PromiseRejectionEvent) => errors.push(String(event.reason))
	const originalConsoleError = console.error
	console.error = (...parts: unknown[]) => errors.push(parts.map(String).join(' '))
	window.addEventListener('error', onError)
	window.addEventListener('unhandledrejection', onRejection)
	try {
		await work()
	} catch (error) {
		errors.push(String(error))
	} finally {
		window.removeEventListener('error', onError)
		window.removeEventListener('unhandledrejection', onRejection)
		console.error = originalConsoleError
	}
	return errors
}

// Probes one attribute: set it in markup terms, read the property back.
const probeAttribute = (host: ElementRecordT, attribute: ManifestAttributeT): string[] => {
	const problems: string[] = []
	const kind = getAttributeKind(attribute.type.text)
	const label = `${host.localName}.${attribute.name}`

	if (kind === 'boolean') {
		host.setAttribute(attribute.name, '')
		if (host[attribute.fieldName] !== true) problems.push(`${label}: attribute present, property is ${String(host[attribute.fieldName])}`)
		host.removeAttribute(attribute.name)
		if (host[attribute.fieldName]) problems.push(`${label}: attribute removed, property is ${String(host[attribute.fieldName])}`)
	}

	if (kind === 'number') {
		host.setAttribute(attribute.name, '3')
		if (host[attribute.fieldName] !== 3) problems.push(`${label}: attribute "3", property is ${String(host[attribute.fieldName])}`)
		host.removeAttribute(attribute.name)
	}

	if (kind === 'string') {
		host.setAttribute(attribute.name, 'probe')
		if (host[attribute.fieldName] !== 'probe') problems.push(`${label}: attribute "probe", property is ${String(host[attribute.fieldName])}`)
		host.removeAttribute(attribute.name)
	}

	if (kind === 'enum') {
		for (const value of getEnumValues(attribute.type.text)) {
			host.setAttribute(attribute.name, value)
			if (host[attribute.fieldName] !== value) problems.push(`${label}: attribute "${value}", property is ${String(host[attribute.fieldName])}`)
		}
		host.removeAttribute(attribute.name)
	}

	return problems
}

// Elements that need a label, a heading or a parent to be a fair thing to
// audit. Everything else is audited as `<tag>Label</tag>`.
const restingFixtures: Record<string, string> = {
	'z-accordion': '<z-accordion><z-collapsible label="First">One</z-collapsible><z-collapsible label="Second">Two</z-collapsible></z-accordion>',
	'z-alert': '<z-alert heading="Heads up">Something happened.</z-alert>',
	'z-collapsible': '<z-collapsible label="Section">Content</z-collapsible>',
	'z-input': '<z-input label="Email"></z-input>',
	'z-number-input': '<z-number-input label="Quantity" value="1"></z-number-input>',
	'z-progress': '<z-progress aria-label="Upload" value="40"></z-progress>',
	'z-select': '<z-select label="Fruit"></z-select>',
	'z-slider': '<z-slider label="Volume"></z-slider>',
	'z-swap': '<z-swap label="Mute"></z-swap>',
	'z-textarea': '<z-textarea label="Notes"></z-textarea>'
}

// Elements that open, audited while open. `is-open` is added to the first tag.
const openFixtures: Record<string, string> = {
	'z-alert-dialog': '<z-alert-dialog heading="Delete item"><p>This cannot be undone.</p></z-alert-dialog>',
	'z-collapsible': '<z-collapsible label="Section">Content</z-collapsible>',
	'z-command': '<z-command placeholder="Search"><z-command-item value="new">New file</z-command-item></z-command>',
	'z-dialog': '<z-dialog heading="Confirm"><p>Body</p><z-button slot="footer">OK</z-button></z-dialog>',
	'z-drawer': '<z-drawer heading="Filters"><p>Body</p></z-drawer>',
	'z-popover': '<z-popover label="Details"><z-button slot="trigger">Open</z-button><p>Body</p></z-popover>',
	'z-sheet': '<z-sheet heading="Settings"><p>Body</p></z-sheet>'
}

const getRestingMarkup = (tag: string): string => restingFixtures[tag] ?? `<${tag}>Label</${tag}>`

const openFirstTag = (markup: string): string => markup.replace(/^<([a-z-]+)/, '<$1 is-open')

// A theme change is a timed sequence: the page fades out (0.2s), swaps, and
// fades in (0.35s). axe samples colours, so it must not run mid-fade.
const THEME_FADE_MS = 800

const useTheme = async (theme: 'dark' | 'light'): Promise<void> => {
	const isAlreadySet = getThemePreference() === theme
	if (isAlreadySet) return
	setThemePreference(theme)
	await new Promise<void>((resolve) => setTimeout(resolve, THEME_FADE_MS))
}

afterEach(() => {
	document.body.replaceChildren()
})

// The preference is stored, so leave it as the next file expects to find it.
afterAll(() => setThemePreference('dark'))

describe('the manifest', () => {
	it('lists every public element', () => {
		expect(tags.length).toBeGreaterThan(90)
	})
})

describe.each(tags)('<%s>', (tag) => {
	it('is registered, upgrades, renders and settles without an error', async () => {
		expect(customElements.get(tag)).toBeDefined()
		const errors = await collectErrors(async () => {
			const host = document.createElement(tag)
			document.body.append(host)
			await settle(document.body)
			expect(host.isConnected).toBe(true)
		})
		expect(errors).toEqual([])
	})

	it('keeps every attribute in step with its property', async () => {
		const declaration = elements.find((entry) => entry.tagName === tag)
		const attributes = declaration?.attributes ?? []
		const problems: string[] = []
		const errors = await collectErrors(async () => {
			const host = document.createElement(tag) as ElementRecordT
			document.body.append(host)
			await settle(document.body)
			for (const attribute of attributes) problems.push(...probeAttribute(host, attribute))
			await settle(document.body)
		})
		expect(problems).toEqual([])
		expect(errors).toEqual([])
	})
})

describe.each(['dark', 'light'] as const)('axe at rest, %s theme', (theme) => {
	it.each(tags)('<%s>', async (tag) => {
		await useTheme(theme)
		const wrapper = await mount(getRestingMarkup(tag))
		await expectNoA11yViolations(wrapper)
	})
})

describe.each(['dark', 'light'] as const)('axe while open, %s theme', (theme) => {
	it.each(Object.keys(openFixtures))('<%s>', async (tag) => {
		await useTheme(theme)
		const wrapper = await mount(openFirstTag(openFixtures[tag]))
		await expectNoA11yViolations(wrapper)
	})
})
