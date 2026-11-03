import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/*
 * The public API has two generated descriptions — custom-elements.json (what
 * the docs, the README catalog and editors read) and dist/components/*.d.ts
 * (what TypeScript consumers read). Both come from the source, by different
 * tools, so they can disagree without anything else noticing. This holds
 * them to each other: every field and event in the manifest is a prop in the
 * declaration with the same type, and every declared prop is in the manifest.
 *
 * Needs a build: `npm run build` produces both files.
 */

const root = join(__dirname, '..', '..')
const manifestPath = join(root, 'custom-elements.json')
const declarationsDir = join(root, 'dist', 'components')

type ManifestElementT = {
	tagName: string
	name: string
	members: Array<{ name: string; type?: { text: string } }>
	events: Array<{ name: string }>
}

const CONSTRUCTOR_TYPES: Record<string, string> = {
	StringConstructor: 'string',
	BooleanConstructor: 'boolean',
	NumberConstructor: 'number',
	ArrayConstructor: 'array',
	ObjectConstructor: 'object',
	FunctionConstructor: 'function',
	PromiseConstructor: 'promise'
}

// `'sm' | 'md' | 'lg'` (manifest) and `"lg" | "md" | "sm"` (declaration) are
// the same union; both become `union:lg|md|sm`.
const unionKey = (text: string): string =>
	`union:${text.split('|').map((member) => member.trim().replace(/^["']|["']$/g, '')).sort().join('|')}`

// Reads `export declare const ZName: ...<{ props: { ... } }>` out of a
// declaration file and returns each prop's name and coarse type.
const readDeclaredProps = (source: string, name: string): Map<string, string> | null => {
	const start = source.indexOf(`export declare const ${name}:`)
	if (start < 0) return null
	const propsStart = source.indexOf('props: {', start)
	if (propsStart < 0) return null
	let depth = 0
	let end = propsStart + 'props: '.length
	for (; end < source.length; end += 1) {
		if (source[end] === '{') depth += 1
		if (source[end] === '}') { depth -= 1; if (depth === 0) break }
	}
	const block = source.slice(propsStart + 'props: {'.length, end)
	const props = new Map<string, string>()
	// Top-level entries only: `name: XConstructor;`, `name: {` or `name: import(...)`.
	let nesting = 0
	for (const rawLine of block.split('\n')) {
		const line = rawLine.trim()
		if (nesting === 0) {
			const match = /^(\w+)\??: (.*)$/.exec(line)
			if (match) {
				const [, propName, rest] = match
				const constructor = /(\w+Constructor)/.exec(rest)?.[1]
				const isEvent = /EventProp|CustomEvent|EventInit/.test(rest)
				const union = /CustomType<([^>]+)>/.exec(rest)?.[1]
				props.set(propName, isEvent ? 'event' : union ? unionKey(union) : constructor ? CONSTRUCTOR_TYPES[constructor] ?? constructor : 'custom')
			}
		}
		nesting += (line.match(/{/g) ?? []).length - (line.match(/}/g) ?? []).length
	}
	// A nested `{ type: XConstructor; ... }` entry was recorded as its constructor above
	// only when the constructor sat on the same line; resolve the rest by re-scanning.
	for (const [propName, type] of props) {
		if (type !== 'custom') continue
		const entry = new RegExp(`\\n\\s*${propName}\\??: \\{[^}]*`, 'm').exec(block)?.[0] ?? ''
		const union = /CustomType<([^>]+)>/.exec(entry)?.[1]
		const constructor = /type: (\w+Constructor)/.exec(entry)?.[1]
		if (union) props.set(propName, unionKey(union))
		else if (constructor) props.set(propName, CONSTRUCTOR_TYPES[constructor] ?? constructor)
		else if (/EventProp|CustomEvent/.test(entry)) props.set(propName, 'event')
	}
	return props
}

const loadDeclarations = (): string => {
	if (!existsSync(declarationsDir)) throw new Error('dist/components is missing — run `npm run build` first')
	return readdirSync(declarationsDir)
		.filter((file) => file.endsWith('.d.ts'))
		.map((file) => readFileSync(join(declarationsDir, file), 'utf8'))
		.join('\n')
}

describe('custom-elements.json agrees with the declarations', () => {
	if (!existsSync(manifestPath)) throw new Error('custom-elements.json is missing — run `npm run build` first')
	const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { modules: Array<{ declarations?: ManifestElementT[] }> }
	const elements = manifest.modules.flatMap((module) => module.declarations ?? []).filter((declaration) => declaration.tagName)
	const declarations = loadDeclarations()

	it('has elements to check', () => {
		expect(elements.length).toBeGreaterThan(0)
	})

	it.each(elements.map((element) => [element.tagName, element] as const))('<%s>', (_tag, element) => {
		const declared = readDeclaredProps(declarations, element.name)
		expect(declared, `no declaration found for ${element.name}`).not.toBeNull()

		const problems: string[] = []
		for (const member of element.members) {
			const declaredType = declared!.get(member.name)
			if (declaredType === undefined) { problems.push(`manifest field "${member.name}" is not a declared prop`); continue }
			const rawManifestType = member.type?.text ?? ''
			const manifestType = rawManifestType.includes('|') ? unionKey(rawManifestType) : rawManifestType
			const comparable = ['string', 'boolean', 'number', 'array', 'object', 'function', 'promise'].includes(declaredType) || declaredType.startsWith('union:')
			if (comparable && manifestType && manifestType !== declaredType) problems.push(`"${member.name}" is ${rawManifestType} in the manifest but ${declaredType} in the declaration`)
		}
		for (const event of element.events) {
			if (declared!.get(event.name) !== 'event') problems.push(`manifest event "${event.name}" is not a declared event prop`)
		}
		const known = new Set([...element.members.map((member) => member.name), ...element.events.map((event) => event.name)])
		for (const propName of declared!.keys()) {
			if (!known.has(propName)) problems.push(`declared prop "${propName}" is not in the manifest`)
		}
		expect(problems).toEqual([])
	})
})
