// Generates custom-elements.json (Custom Elements Manifest, schema 1.0.0) for
// the Zest library.
//
// Atomico defines components with a factory — `c(render, { props })` followed by
// `customElements.define('tag', Component)` — which the official CEM analyzer
// doesn't understand. So we parse the source ourselves with the TypeScript AST
// and extract, for each defined element: its tag name, its class/constructor
// name, and the reflected props (which become both fields and attributes).
//
// Props can be written three ways, all handled here:
//   props: { size: { type: String, reflect: true }, label: String }   // inline
//   props: textProps                                                   // local const
//   props: toggleVariantProps                                          // imported const
// ...and a props object may `...spread` another props object.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

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

const programs = sourceFiles.map((file) => ({
	file,
	sf: ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
}))

// --- prop-object resolution ----------------------------------------------------

// Map of identifier name -> ObjectLiteralExpression for every top-level
// `const NAME = { ... }` (or `{ ... } as const`) across the whole library, so we
// can resolve `props: textProps` regardless of which file it lives in.
const propObjectsByName = new Map()

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

const camelToKebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').toLowerCase()

// Resolve a value that should be a props object (object literal or identifier)
// into a flat map of propName -> cemType. Spreads are merged recursively.
const resolveProps = (node, seen = new Set()) => {
	const out = {}
	const target = unwrap(node)
	if (!target) return out

	let objectLiteral = null
	if (ts.isObjectLiteralExpression(target)) objectLiteral = target
	else if (ts.isIdentifier(target)) {
		if (seen.has(target.text)) return out
		seen.add(target.text)
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

		// Shorthand: `label: String`
		const value = unwrap(prop.initializer)
		let cemType = 'string'
		if (ts.isIdentifier(value)) {
			cemType = ATOMICO_TYPE_TO_CEM[value.text] ?? 'string'
		} else if (ts.isObjectLiteralExpression(value)) {
			// Long form: `{ type: Boolean, reflect: true }`
			const typeProp = value.properties.find(
				(p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'type'
			)
			if (typeProp && ts.isIdentifier(typeProp.initializer)) {
				cemType = ATOMICO_TYPE_TO_CEM[typeProp.initializer.text] ?? 'string'
			}
		}
		out[key] = cemType
	}
	return out
}

// --- find component definitions ------------------------------------------------

// For each file, map the variable name passed to c(...) to its props object, so
// that when we hit `customElements.define('tag', ZButton)` we can look up props.
const declarations = []
const exportsList = []

for (const { file, sf } of programs) {
	const propsByVar = new Map()

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
					propsByVar.set(decl.name.text, props)
				}
			}
		}
		ts.forEachChild(node, collectFactories)
	}
	collectFactories(sf)

	const collectDefines = (node) => {
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			ts.isIdentifier(node.expression.expression) &&
			node.expression.expression.text === 'customElements' &&
			node.expression.name.text === 'define'
		) {
			const [tagArg, ctorArg] = node.arguments
			if (tagArg && ts.isStringLiteral(tagArg) && ctorArg && ts.isIdentifier(ctorArg)) {
				const tagName = tagArg.text
				const className = ctorArg.text
				const props = propsByVar.get(className) ?? {}
				const modulePath = 'dist/zest.js'

				const members = Object.entries(props).map(([name, type]) => ({
					kind: 'field',
					name,
					type: { text: type }
				}))
				const attributes = Object.entries(props).map(([name, type]) => ({
					name: camelToKebab(name),
					fieldName: name,
					type: { text: type }
				}))

				declarations.push({
					sourceFile: relative(root, file).replace(/\\/g, '/'),
					declaration: {
						kind: 'class',
						customElement: true,
						tagName,
						name: className,
						members,
						attributes
					},
					export: {
						kind: 'custom-element-definition',
						name: tagName,
						declaration: { name: className, module: modulePath }
					}
				})
			}
		}
		ts.forEachChild(node, collectDefines)
	}
	collectDefines(sf)
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

writeFileSync(join(root, 'custom-elements.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(`custom-elements.json: ${declarations.length} elements`)
