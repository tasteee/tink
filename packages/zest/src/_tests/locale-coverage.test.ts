// @ts-expect-error The build inventory is JavaScript; this test uses the same
// source of truth that decides which elements are public.
import { getPublicElementEntries } from '../../scripts/public-element-entries.mjs'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/*
 * Every string zest says on its own comes from shared/locale.ts, so
 * setLocale() can replace it. A literal English name in an aria-label, a
 * title, a placeholder, or an `|| 'Text'` fallback in a public element is a
 * string an app in another language cannot reach. This reads the source and
 * fails on one.
 */

type EntryT = { tag: string; sourceFile: string }

const entries = getPublicElementEntries() as EntryT[]
const sourceFiles = [...new Set(entries.map((entry) => entry.sourceFile))]

// An attribute set to words: aria-label="Hue", title='Close', placeholder="Search".
const literalAttributePattern = /\b(aria-label|aria-description|title|placeholder|alt)=(["'])[A-Za-z][^"']*\2/
// A visible fallback: {props.label || 'Learn more'}. Capitalised words only,
// so a lowercase CSS keyword such as `|| 'auto'` is not a sentence.
const literalFallbackPattern = /\|\|\s*'[A-Z][A-Za-z ]+[.…]?'/

const isCommentLine = (line: string): boolean => {
	const trimmed = line.trim()
	return trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*')
}

const findLiterals = (file: string): string[] => {
	const lines = readFileSync(file, 'utf8').split('\n')
	const found: string[] = []
	lines.forEach((line, index) => {
		if (isCommentLine(line)) return
		const isLiteral = literalAttributePattern.test(line) || literalFallbackPattern.test(line)
		if (isLiteral) found.push(`${file.split('/').slice(-2).join('/')}:${index + 1}  ${line.trim()}`)
	})
	return found
}

describe('locale coverage', () => {
	it('finds the public element sources', () => {
		expect(sourceFiles.length).toBeGreaterThan(60)
	})

	it('has no hardcoded English in the public elements', () => {
		const literals = sourceFiles.flatMap((file) => findLiterals(file))
		expect(literals).toEqual([])
	})
})
