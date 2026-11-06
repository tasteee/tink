// Generates custom-elements.json (Custom Elements Manifest, schema 1.0.0) for
// the Zest library.
//
// Atomico defines components with a factory, `c(render, { props })` followed by
// `defineElement('tag', Component)`, which the official CEM analyzer
// doesn't understand. So we parse the source ourselves with the TypeScript AST
// and extract, for each defined element: its tag name, its class/constructor
// name, and the reflected props (which become both fields and attributes).
//
// Props can be written three ways, all handled here:
//   props: { size: { type: String, reflect: true }, label: String }   // inline
//   props: textProps                                                   // local const
//   props: toggleVariantProps                                          // imported const
//   props: directionLockedBoxProps                                     // derived
// ...and a props object may `...spread` another props object. A derived one is
// built by a call, `omitProps(boxProps, ['direction'])`, which is resolved
// too; this remains necessary for derived prop objects used by z-box helpers.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { getPublicElementEntries } from './public-element-entries.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const srcDir = join(root, 'src')

// --- collect every source file -------------------------------------------------

const sourceFiles = []
const walk = (dir) => {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name)
		if (entry.isDirectory()) walk(full)
		else if (/\.tsx?$/.test(entry.name)) sourceFiles.push(full)
	}
}
walk(srcDir)

// The same inventory drives the root bundle, package subpaths, declarations,
// and this manifest. Source files may remain in the repository while an
// experimental element is held back from a release.
const publicElements = getPublicElementEntries()

// api-notes.json holds the written description of every element, attribute and
// event. It is merged in below so editors that read this manifest show docs on
// hover. scripts/check-release-surface.mjs fails the build if anything lacks one.
const apiNotes = JSON.parse(readFileSync(join(root, 'api-notes.json'), 'utf8'))

const programs = sourceFiles.map((file) => ({
	file,
	sf: ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
}))

// --- prop-object resolution ----------------------------------------------------

// Map of identifier name -> ObjectLiteralExpression for every top-level
// `const NAME = { ... }` (or `{ ... } as const`) across the whole library, so we
// can resolve `props: textProps` regardless of which file it lives in.
const propObjectsByName = new Map()
const derivedPropsByName = new Map()

const unwrap = (node) => {
	let n = node
	while (n && (ts.isAsExpression(n) || ts.isParenthesizedExpression(n) || ts.isSatisfiesExpression?.(n))) {
		n = n.expression
	}
	return n
}

for (const { sf } of programs) {
	sf.forEachChild((node) => {
		if (!ts.isVariableStatement(node)) return
		for (const decl of node.declarationList.declarations) {
			if (!decl.initializer || !ts.isIdentifier(decl.name)) continue
			const init = unwrap(decl.initializer)
			if (init && ts.isObjectLiteralExpression(init)) {
				propObjectsByName.set(decl.name.text, init)
				continue
			}

			// A props object can also be derived rather than written out —
			// `omitProps(boxProps, ['direction'])`. Index the expression so an
			// identifier pointing at it still resolves.
			if (init && ts.isCallExpression(init)) {
				derivedPropsByName.set(decl.name.text, init)
			}
		}
	})
}

const ATOMICO_TYPE_TO_CEM = {
	String: 'string',
	Boolean: 'boolean',
	Number: 'number',
	Object: 'object',
	Array: 'array'
}

const buildPropDescriptor = (type, options = {}) => ({
	type,
	isAttribute: ['string', 'boolean', 'number'].includes(type),
	isEvent: false,
	eventDetail: '',
	...options
})

// `{ type: Boolean, value: false }` → "false". Factory defaults
// (`value: () => true`) report what the factory returns when it is a
// single literal, so the docs show the real default.
const readDefaultText = (objectLiteral) => {
	const defaultProp = objectLiteral.properties.find(
		(prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'value'
	)
	if (!defaultProp) return undefined
	const initializer = defaultProp.initializer
	const isFactory = ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer)
	if (!isFactory) return initializer.getText()
	const body = initializer.body
	const isLiteralBody = ts.isStringLiteral(body) || ts.isNumericLiteral(body) || body.kind === ts.SyntaxKind.TrueKeyword || body.kind === ts.SyntaxKind.FalseKeyword
	if (isLiteralBody) return body.getText()
	return undefined
}

const resolvePropDescriptor = (node) => {
	const value = unwrap(node)
	if (!value) return buildPropDescriptor('string')

	if (ts.isIdentifier(value)) {
		const type = ATOMICO_TYPE_TO_CEM[value.text] ?? (value.text === 'Function' ? 'function' : 'string')
		return buildPropDescriptor(type)
	}

	if (ts.isCallExpression(value) && ts.isIdentifier(value.expression)) {
		if (value.expression.text === 'event') {
			const eventDetail = value.typeArguments?.[0]?.getText() ?? 'void'
			return buildPropDescriptor('function', { isAttribute: false, isEvent: true, eventDetail })
		}
		if (value.expression.text === 'callback') return buildPropDescriptor('function', { isAttribute: false })
		// oneOf('sm', 'md', 'lg') — shared/prop-types.ts. A string attribute whose
		// declared type is the literal union; the manifest says the same.
		if (value.expression.text === 'oneOf') {
			const members = value.arguments.filter((argument) => ts.isStringLiteral(argument)).map((argument) => `'${argument.text}'`)
			return buildPropDescriptor(members.join(' | '), { isAttribute: true })
		}
	}

	if (ts.isObjectLiteralExpression(value)) {
		const typeProp = value.properties.find(
			(prop) => ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'type'
		)
		if (typeProp && ts.isPropertyAssignment(typeProp)) {
			const descriptor = resolvePropDescriptor(typeProp.initializer)
			const defaultText = readDefaultText(value)
			const hasDefault = defaultText !== undefined
			if (hasDefault) descriptor.default = defaultText
			return descriptor
		}
	}

	return buildPropDescriptor('string')
}

const camelToKebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').toLowerCase()

// Resolve a value that should be a props object (object literal or identifier)
// into a flat map of propName -> cemType. Spreads are merged recursively.
const resolveProps = (node, seen = new Set()) => {
	const out = {}
	const target = unwrap(node)
	if (!target) return out

	// `omitProps(boxProps, ['direction'])` — a props object derived by dropping
	// keys from another. This keeps derived prop objects visible to the manifest.
	if (ts.isCallExpression(target) && ts.isIdentifier(target.expression) && target.expression.text === 'omitProps') {
		const sourceArgument = target.arguments[0]
		const omittedArgument = target.arguments[1]

		const resolved = sourceArgument ? resolveProps(sourceArgument, seen) : {}
		const omitted = new Set()

		if (omittedArgument && ts.isArrayLiteralExpression(omittedArgument)) {
			for (const element of omittedArgument.elements) {
				if (ts.isStringLiteral(element)) omitted.add(element.text)
			}
		}

		for (const key of Object.keys(resolved)) {
			if (!omitted.has(key)) out[key] = resolved[key]
		}
		return out
	}

	let objectLiteral = null
	if (ts.isObjectLiteralExpression(target)) objectLiteral = target
	else if (ts.isIdentifier(target)) {
		if (seen.has(target.text)) return out
		seen.add(target.text)

		const derived = derivedPropsByName.get(target.text)
		if (derived) return resolveProps(derived, seen)

		objectLiteral = propObjectsByName.get(target.text) ?? null
	}
	if (!objectLiteral) return out

	for (const prop of objectLiteral.properties) {
		if (ts.isSpreadAssignment(prop)) {
			Object.assign(out, resolveProps(prop.expression, seen))
			continue
		}
		if (!ts.isPropertyAssignment(prop)) continue
		const key = prop.name && (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) ? prop.name.text : null
		if (!key) continue

		out[key] = resolvePropDescriptor(prop.initializer)
	}
	return out
}

// --- find component definitions ------------------------------------------------

// Map every constructor passed through Atomico's c(...) factory to its props.
// Some source modules contain multiple constructors whose registrations live
// in separate element entry files, so this lookup intentionally spans files.
const declarations = []
const propsByClassName = new Map()

for (const { file, sf } of programs) {
	const collectFactories = (node) => {
		if (ts.isVariableStatement(node)) {
			for (const decl of node.declarationList.declarations) {
				if (!decl.initializer || !ts.isIdentifier(decl.name)) continue
				const init = unwrap(decl.initializer)
				// const ZButton = c(render, { props, styles })
				if (init && ts.isCallExpression(init) && ts.isIdentifier(init.expression) && init.expression.text === 'c') {
					const options = init.arguments[1]
					let props = {}
					if (options && ts.isObjectLiteralExpression(options)) {
						const propsProp = options.properties.find(
							(p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'props'
						)
						if (propsProp) props = resolveProps(propsProp.initializer)
					}
					propsByClassName.set(decl.name.text, props)
				}
			}
		}
		ts.forEachChild(node, collectFactories)
	}
	collectFactories(sf)
}

for (const { tag: tagName, className, sourceFile } of publicElements) {
	const props = propsByClassName.get(className) ?? {}
	const modulePath = 'dist/zest.js'
	const tagNotes = apiNotes[tagName] ?? {}
	const propNotes = tagNotes.props ?? {}
	const eventNotes = tagNotes.events ?? {}
	// The default slot is the unnamed one, which the manifest spells as ''.
	const slots = Object.entries(tagNotes.slots ?? {}).map(([name, description]) => ({ name: name === 'default' ? '' : name, description }))
	const cssProperties = Object.entries(tagNotes.cssProperties ?? {}).map(([name, note]) => ({ name, description: note.description, ...(note.default ? { default: note.default } : {}) }))
	const cssParts = Object.entries(tagNotes.cssParts ?? {}).map(([name, description]) => ({ name, description }))
	const getDescription = (notes, key) => (notes[key]?.description ? { description: notes[key].description } : {})
	const members = Object.entries(props).filter(([, descriptor]) => !descriptor.isEvent).map(([name, descriptor]) => ({
		kind: 'field',
		name,
		type: { text: descriptor.type },
		...(descriptor.default === undefined ? {} : { default: descriptor.default }),
		...getDescription(propNotes, camelToKebab(name))
	}))
	// Array and object props are listed too: the docs site reads this list
	// as the element's whole configurable surface, not only HTML attributes.
	const attributes = Object.entries(props).filter(([, descriptor]) => !descriptor.isEvent).map(([name, descriptor]) => ({
		name: camelToKebab(name),
		fieldName: name,
		type: { text: descriptor.type },
		...(descriptor.default === undefined ? {} : { default: descriptor.default }),
		...getDescription(propNotes, camelToKebab(name))
	}))
	const events = Object.entries(props).filter(([, descriptor]) => descriptor.isEvent).map(([name, descriptor]) => ({
		name,
		type: { text: descriptor.eventDetail === 'void' ? 'CustomEvent' : `CustomEvent<${descriptor.eventDetail}>` },
		detail: descriptor.eventDetail,
		...getDescription(eventNotes, name)
	}))

	declarations.push({
		sourceFile: relative(root, sourceFile).replace(/\\/g, '/'),
		declaration: {
			kind: 'class',
			customElement: true,
			tagName,
			name: className,
			...(tagNotes.summary ? { description: tagNotes.summary } : {}),
			members,
			attributes,
			events,
			...(slots.length ? { slots } : {}),
			...(cssProperties.length ? { cssProperties } : {}),
			...(cssParts.length ? { cssParts } : {})
		},
		export: {
			kind: 'custom-element-definition',
			name: tagName,
			declaration: { name: className, module: modulePath }
		}
	})
}

// Stable order by tag name.
declarations.sort((a, b) => a.declaration.tagName.localeCompare(b.declaration.tagName))

// Single bundled module: everything the package ships lives in dist/zest.js.
const manifest = {
	schemaVersion: '1.0.0',
	readme: 'README.md',
	modules: [
		{
			kind: 'javascript-module',
			path: 'dist/zest.js',
			declarations: declarations.map((d) => d.declaration),
			exports: declarations.map((d) => d.export)
		}
	]
}

const manifestPath = join(root, 'custom-elements.json')
const manifestSource = JSON.stringify(manifest, null, 2) + '\n'
if (readFileSync(manifestPath, 'utf8') !== manifestSource) {
	writeFileSync(manifestPath, manifestSource)
}
console.log(`custom-elements.json: ${declarations.length} elements`)
