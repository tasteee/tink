import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPublicElementEntries } from './public-element-entries.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const manifest = JSON.parse(readFileSync(join(root, 'custom-elements.json'), 'utf8'))
const declarations = manifest.modules.flatMap((module) => module.declarations ?? [])
const tags = declarations.filter((declaration) => declaration.customElement).map((declaration) => declaration.tagName)
const elementEntries = getPublicElementEntries()
const entryTags = elementEntries.map((entry) => entry.tag)

// Elements that exist in source but are not public: no manifest
// entry, no subpath, no docs promise. Empty today; add a tag here to
// keep an unfinished element out of a release.
const heldBackTags = new Set([])

const failures = []
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
if (packageJson.exports?.['./*']?.import !== './dist/elements/*.js') failures.push('package element import wildcard is missing')
if (packageJson.exports?.['./*']?.types !== './dist/elements/*.d.ts') failures.push('package element types wildcard is missing')

if (failures.length) {
	console.error(failures.map((failure) => `- ${failure}`).join('\n'))
	process.exit(1)
}

console.log(`release surface: ${tags.length} public elements and individual subpaths, held-back elements absent`)
