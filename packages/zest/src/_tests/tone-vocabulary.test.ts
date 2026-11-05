import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/*
 * One vocabulary per enum prop name for the whole library. An element takes
 * only the values it can render, but every value it takes comes from the
 * shared list and means the same thing everywhere. A plain `string` would let
 * any word through, so it fails here too.
 *
 * Two exceptions are open on purpose: `z-container` and `z-spacer` take any
 * CSS length or width token for `size`.
 */

const sharedTones = ['neutral', 'primary', 'secondary', 'success', 'warning', 'danger']
const sharedSizes = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']
const sharedVisualKinds = ['solid', 'soft', 'outline', 'ghost', 'plain']
const openSizeTags = ['z-container', 'z-spacer']
// `kind` picks a layout, not a look, on these two.
const layoutKindTags = ['z-swap', 'z-theme-switcher']

type ManifestAttributeT = { name: string; type?: { text?: string } }
type ManifestDeclarationT = { tagName?: string; customElement?: boolean; attributes?: ManifestAttributeT[] }
type ManifestT = { modules: { declarations?: ManifestDeclarationT[] }[] }

const manifestPath = join(__dirname, '..', '..', 'custom-elements.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ManifestT

const getEntries = (propName: string) => {
	const declarations = manifest.modules.flatMap((module) => module.declarations ?? [])
	const customElements = declarations.filter((declaration) => declaration.customElement)
	const entries = []

	for (const declaration of customElements) {
		const propAttribute = declaration.attributes?.find((attribute) => attribute.name === propName)
		if (!propAttribute) continue
		const typeText = propAttribute.type?.text ?? ''
		entries.push({ tagName: declaration.tagName, typeText })
	}

	return entries
}

const getTypeValues = (typeText: string): string[] => {
	const matches = typeText.matchAll(/'([^']+)'/g)
	return [...matches].map((match) => match[1])
}

const getUntypedTags = (entries: { tagName?: string; typeText: string }[]) => {
	const untyped = entries.filter((entry) => getTypeValues(entry.typeText).length === 0)
	return untyped.map((entry) => entry.tagName)
}

const getStrays = (entries: { tagName?: string; typeText: string }[], allowed: string[]) => {
	const strays = []

	for (const entry of entries) {
		const values = getTypeValues(entry.typeText)
		const unknownValues = values.filter((value) => !allowed.includes(value))
		if (unknownValues.length > 0) strays.push(`${entry.tagName}: ${unknownValues.join(', ')}`)
	}

	return strays
}

describe('tone vocabulary', () => {
	const toneEntries = getEntries('tone')

	it('finds the elements that take a tone', () => {
		expect(toneEntries.length).toBeGreaterThan(30)
	})

	it('types every tone as a list of values, never a plain string', () => {
		expect(getUntypedTags(toneEntries)).toEqual([])
	})

	it('only uses tones from the shared list', () => {
		expect(getStrays(toneEntries, sharedTones)).toEqual([])
	})
})

describe('size vocabulary', () => {
	const closedSizeEntries = getEntries('size').filter((entry) => !openSizeTags.includes(entry.tagName ?? ''))

	it('finds the elements that take a size', () => {
		expect(closedSizeEntries.length).toBeGreaterThan(25)
	})

	it('types every closed size as a list of values, never a plain string', () => {
		expect(getUntypedTags(closedSizeEntries)).toEqual([])
	})

	it('only uses sizes from the shared scale', () => {
		expect(getStrays(closedSizeEntries, sharedSizes)).toEqual([])
	})

	it('keeps z-container and z-spacer open', () => {
		const openEntries = getEntries('size').filter((entry) => openSizeTags.includes(entry.tagName ?? ''))
		const typedOpenTags = openEntries.filter((entry) => getTypeValues(entry.typeText).length > 0)
		expect(typedOpenTags).toEqual([])
	})
})

describe('kind vocabulary', () => {
	const kindEntries = getEntries('kind')
	const visualEntries = kindEntries.filter((entry) => !layoutKindTags.includes(entry.tagName ?? ''))

	it('types every kind as a list of values, never a plain string', () => {
		expect(getUntypedTags(kindEntries)).toEqual([])
	})

	it('draws every visual kind from one list', () => {
		expect(getStrays(visualEntries, sharedVisualKinds)).toEqual([])
	})
})
