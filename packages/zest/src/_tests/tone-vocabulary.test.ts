import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/*
 * One `tone` vocabulary for the whole library. An element takes only the
 * tones it can paint, but every tone it takes comes from this list and
 * means the same thing everywhere. A plain `string` would let any word
 * through, so it fails here too.
 */

const sharedTones = ['neutral', 'primary', 'secondary', 'success', 'warning', 'danger']

type ManifestAttributeT = { name: string; type?: { text?: string } }
type ManifestDeclarationT = { tagName?: string; customElement?: boolean; attributes?: ManifestAttributeT[] }
type ManifestT = { modules: { declarations?: ManifestDeclarationT[] }[] }

const manifestPath = join(__dirname, '..', '..', 'custom-elements.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ManifestT

const getToneEntries = () => {
	const declarations = manifest.modules.flatMap((module) => module.declarations ?? [])
	const customElements = declarations.filter((declaration) => declaration.customElement)
	const entries = []

	for (const declaration of customElements) {
		const toneAttribute = declaration.attributes?.find((attribute) => attribute.name === 'tone')
		if (!toneAttribute) continue
		const typeText = toneAttribute.type?.text ?? ''
		entries.push({ tagName: declaration.tagName, typeText })
	}

	return entries
}

const getTypeValues = (typeText: string): string[] => {
	const matches = typeText.matchAll(/'([^']+)'/g)
	return [...matches].map((match) => match[1])
}

describe('tone vocabulary', () => {
	const toneEntries = getToneEntries()

	it('finds the elements that take a tone', () => {
		expect(toneEntries.length).toBeGreaterThan(30)
	})

	it('types every tone as a list of values, never a plain string', () => {
		const untyped = toneEntries.filter((entry) => getTypeValues(entry.typeText).length === 0)
		const untypedTags = untyped.map((entry) => entry.tagName)
		expect(untypedTags).toEqual([])
	})

	it('only uses tones from the shared list', () => {
		const strays = []

		for (const entry of toneEntries) {
			const values = getTypeValues(entry.typeText)
			const unknownValues = values.filter((value) => !sharedTones.includes(value))
			if (unknownValues.length > 0) strays.push(`${entry.tagName}: ${unknownValues.join(', ')}`)
		}

		expect(strays).toEqual([])
	})
})
