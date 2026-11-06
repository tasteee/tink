import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPublicElementEntries } from './public-element-entries.mjs'
import { heldBackTags as heldBackList } from './held-back.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const manifest = JSON.parse(readFileSync(join(root, 'custom-elements.json'), 'utf8'))
const declarations = manifest.modules.flatMap((module) => module.declarations ?? [])
const tags = declarations.filter((declaration) => declaration.customElement).map((declaration) => declaration.tagName)
const elementEntries = getPublicElementEntries()
const entryTags = elementEntries.map((entry) => entry.tag)

// Elements that exist in source but are not public (scripts/held-back.mjs):
// no manifest entry, no subpath, no docs promise.
const heldBackTags = new Set(heldBackList)

const failures = []
const rootEntrySource = readFileSync(join(root, 'src', 'index.ts'), 'utf8')
for (const tag of heldBackTags) {
	if (rootEntrySource.includes(`./components/${tag}'`) || rootEntrySource.includes(`./elements/${tag}'`)) failures.push(`${tag} is held back but src/index.ts exports it`)
}
const duplicates = tags.filter((tag, index) => tags.indexOf(tag) !== index)
if (duplicates.length) failures.push(`duplicate manifest tags: ${[...new Set(duplicates)].join(', ')}`)

const leakedTags = tags.filter((tag) => heldBackTags.has(tag))
if (leakedTags.length) failures.push(`held-back tags in manifest: ${leakedTags.join(', ')}`)

if (JSON.stringify(tags.slice().sort()) !== JSON.stringify(entryTags.slice().sort())) {
	failures.push('manifest tags and package element subpaths do not match')
}

for (const tag of entryTags) {
	if (!existsSync(join(root, 'dist', 'elements', `${tag}.js`))) failures.push(`missing JavaScript subpath for ${tag}`)
	if (!existsSync(join(root, 'dist', 'elements', `${tag}.d.ts`))) failures.push(`missing declaration subpath for ${tag}`)
}

for (const declaration of declarations) {
	for (const attribute of declaration.attributes ?? []) {
		const type = attribute.type?.text
		// Arrays, objects and callbacks are listed on purpose: the docs
		// site reads this list as the element's whole configurable surface.
		const isUntyped = !type
		if (isUntyped) failures.push(`${declaration.tagName}.${attribute.name} has no type`)
	}
	const eventNames = new Set((declaration.events ?? []).map((event) => event.name))
	for (const member of declaration.members ?? []) {
		if (eventNames.has(member.name)) failures.push(`${declaration.tagName}.${member.name} is both an event and a field`)
	}
}


for (const declaration of declarations) {
	for (const member of declaration.members ?? []) {
		const isBoolean = member.type?.text === 'boolean'
		const hasQuestionPrefix = /^(is|has|can|should|was|will|does)[A-Z]/.test(member.name)
		const isUnprefixedBoolean = isBoolean && !hasQuestionPrefix
		if (isUnprefixedBoolean) failures.push(`${declaration.tagName} boolean ${member.name} needs an is/has/can/should/was/will/does prefix`)
		// An HTML attribute can only switch a boolean on, so one that
		// defaults to true could never be turned off from markup.
		const isDefaultTrue = isBoolean && member.default === 'true'
		if (isDefaultTrue) failures.push(`${declaration.tagName} boolean ${member.name} defaults to true; invert it so markup can set it`)
		if (member.name === 'accent') failures.push(`${declaration.tagName} exposes accent instead of tone`)
	}
}

// Every public element, attribute and event carries a written description in
// custom-elements.json, so editor hover docs are never empty. The text lives in
// api-notes.json. A note for something that no longer exists is stale, so it
// fails too: the docs and the shipped surface cannot drift apart.
const apiNotes = JSON.parse(readFileSync(join(root, 'api-notes.json'), 'utf8'))
for (const declaration of declarations) {
	if (!declaration.description) failures.push(`${declaration.tagName} has no description (add "summary" to api-notes.json)`)
	for (const attribute of declaration.attributes ?? []) {
		if (!attribute.description) failures.push(`${declaration.tagName}.${attribute.name} has no description (api-notes.json)`)
	}
	for (const event of declaration.events ?? []) {
		if (!event.description) failures.push(`${declaration.tagName} event ${event.name} has no description (api-notes.json)`)
	}
}
// The allowed values the docs list for a prop must be the values its type
// allows, in both directions. A closed type with no list in the notes, a list
// that differs from the type, and a list on a plain `string` are all drift.
// A prop that is open on purpose says so with "open": true in its note.
const unionPattern = /^\s*('[^']+'\s*\|\s*)*'[^']+'(\s*\|\s*undefined)?\s*$/
const getUnionValues = (typeText) => [...typeText.matchAll(/'([^']+)'/g)].map((match) => match[1])
for (const declaration of declarations) {
	const propNotes = apiNotes[declaration.tagName]?.props ?? {}
	for (const attribute of declaration.attributes ?? []) {
		const note = propNotes[attribute.name]
		const typeText = attribute.type?.text ?? ''
		const isClosed = unionPattern.test(typeText)
		const listedValues = note?.values
		const label = `${declaration.tagName}.${attribute.name}`
		if (isClosed && !listedValues) failures.push(`${label} is typed ${typeText} but api-notes.json lists no values`)
		if (isClosed && listedValues) {
			const typeValues = getUnionValues(typeText).sort().join(' | ')
			const noteValues = [...listedValues].sort().join(' | ')
			if (typeValues !== noteValues) failures.push(`${label} docs list [${noteValues}] but the type allows [${typeValues}]`)
		}
		if (!isClosed && listedValues && !note.open) failures.push(`${label} docs list values but the type is ${typeText}; type it, or mark the note "open": true`)
	}
}

// Every element page carries an accessibility note and a keyboard decision: a
// list of keys, or an empty list that says the element takes no keyboard input.
// What the docs call a slot, a CSS property or a part also has a description.
for (const declaration of declarations) {
	const notes = apiNotes[declaration.tagName] ?? {}
	if (!notes.accessibility) failures.push(`${declaration.tagName} has no accessibility note (api-notes.json)`)
	if (!Array.isArray(notes.keyboard)) failures.push(`${declaration.tagName} has no keyboard entry (api-notes.json; use [] if it takes no keys)`)
	for (const entry of notes.keyboard ?? []) {
		if (!entry.keys || !entry.action) failures.push(`${declaration.tagName} has a keyboard entry without keys or an action`)
	}
	for (const group of ['slots', 'cssProperties', 'cssParts']) {
		for (const item of declaration[group] ?? []) {
			if (!item.description) failures.push(`${declaration.tagName} ${group} "${item.name}" has no description`)
		}
	}
}
// A documented slot must exist in the element's source. The default slot is a
// <slot> with no name; a named one is spelled out, or built from a variable.
for (const entry of elementEntries) {
	const slotNames = Object.keys(apiNotes[entry.tag]?.slots ?? {})
	if (!slotNames.length) continue
	const source = readFileSync(entry.sourceFile, 'utf8')
	const hasDynamicSlots = /<slot\s+name=\{/.test(source)
	for (const name of slotNames) {
		const isDefault = name === 'default'
		const hasDefaultSlot = /<slot(?![^>]*\bname=)/.test(source)
		const hasNamedSlot = new RegExp(`<slot[^>]*\\bname=["']${name}["']`).test(source)
		const exists = isDefault ? hasDefaultSlot : hasNamedSlot || hasDynamicSlots
		if (!exists) failures.push(`${entry.tag} documents slot "${name}", which its source does not render`)
	}
}
const declarationsByTag = new Map(declarations.map((declaration) => [declaration.tagName, declaration]))
for (const [tag, notes] of Object.entries(apiNotes)) {
	const declaration = declarationsByTag.get(tag)
	if (!declaration) {
		failures.push(`api-notes.json describes ${tag}, which is not a public element`)
		continue
	}
	const attributeNames = new Set((declaration.attributes ?? []).map((attribute) => attribute.name))
	const eventNames = new Set((declaration.events ?? []).map((event) => event.name))
	for (const propName of Object.keys(notes.props ?? {})) {
		if (!attributeNames.has(propName)) failures.push(`api-notes.json describes ${tag}.${propName}, which does not exist`)
	}
	for (const eventName of Object.keys(notes.events ?? {})) {
		if (!eventNames.has(eventName)) failures.push(`api-notes.json describes ${tag} event ${eventName}, which does not exist`)
	}
}

const bundle = readFileSync(join(root, 'dist', 'zest.js'), 'utf8')
for (const tag of heldBackTags) {
	if (bundle.includes(`"${tag}"`) || bundle.includes(`'${tag}'`)) {
		failures.push(`${tag} leaked into dist/zest.js`)
	}
}

const componentDir = join(root, 'src', 'components')
const inventoriedFiles = new Set(elementEntries.map((entry) => entry.sourceFile))
const indexSource = readFileSync(join(root, 'src', 'index.ts'), 'utf8')
for (const name of readdirSync(componentDir).filter((entry) => entry.endsWith('.tsx'))) {
	const path = join(componentDir, name)
	const source = readFileSync(path, 'utf8')
	if (source.includes('customElements.define(')) failures.push(`${name} bypasses defineElement`)
	// A component the root entry exports must register at least one element
	// the inventory can see. The inventory is a source pattern; a new way of
	// registering (defineFormElement was one) must be taught to it, or the
	// element silently drops out of the manifest, the catalog and dist/elements.
	const isExported = indexSource.includes(`./components/${name.slice(0, -4)}'`)
	const registers = /define\w*Element\(/.test(source)
	if (isExported && registers && !inventoriedFiles.has(path)) failures.push(`${name} registers an element the inventory does not see (scripts/public-element-entries.mjs)`)
}

const declarationDir = join(root, 'dist', 'components')
if (existsSync(declarationDir)) {
	const declarationNames = new Set(readdirSync(declarationDir).filter((name) => name.endsWith('.d.ts')).map((name) => name.slice(0, -5)))
	for (const tag of heldBackTags) {
		if (declarationNames.has(tag)) failures.push(`${tag}.d.ts leaked into the public declaration output`)
	}
}

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
if (!packageJson.dependencies?.atomico) failures.push('atomico must be a dependency because public declarations reference its types')
if (packageJson.dependencies?.['@tasteee/wired']) failures.push('@tasteee/wired is internalized; it must not be a dependency')
if (packageJson.exports?.['./fonts.css'] !== './dist/fonts.css') failures.push('package fonts.css subpath is missing')
if (!existsSync(join(root, 'dist', 'fonts.css'))) failures.push('dist/fonts.css is missing')
if (readFileSync(join(root, 'dist', 'ink.css'), 'utf8').includes('fonts.googleapis.com')) failures.push('ink.css loads fonts from Google; that belongs to fonts.css')
if (packageJson.exports?.['./react']?.types !== './dist/react.d.ts') failures.push('package react typings subpath is missing')
if (!existsSync(join(root, 'dist', 'react.d.ts'))) {
	failures.push('dist/react.d.ts is missing')
} else {
	const reactTypes = readFileSync(join(root, 'dist', 'react.d.ts'), 'utf8')
	for (const tag of entryTags) {
		if (!reactTypes.includes(`'${tag}':`)) failures.push(`dist/react.d.ts has no typing for ${tag}`)
	}
}
if (packageJson.exports?.['./*']?.import !== './dist/elements/*.js') failures.push('package element import wildcard is missing')
if (packageJson.exports?.['./*']?.types !== './dist/elements/*.d.ts') failures.push('package element types wildcard is missing')

if (failures.length) {
	console.error(failures.map((failure) => `- ${failure}`).join('\n'))
	process.exit(1)
}

console.log(`release surface: ${tags.length} public elements and individual subpaths, held-back elements absent`)
