import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptsDir = dirname(fileURLToPath(import.meta.url))
export const projectRoot = join(scriptsDir, '..')
export const sourceRoot = join(projectRoot, 'src')

// defineFormElement (shared/form-control.ts) registers the form-associated
// controls through the same guard, so it counts as a definition here too.
const definitionPattern = /define(?:Form)?Element\(\s*['"]([^'"]+)['"]\s*,\s*([A-Za-z_$][\w$]*)\s*\)/g

const definitionsIn = (file) => {
	const source = readFileSync(file, 'utf8')
	return [...source.matchAll(definitionPattern)].map((match) => ({ tag: match[1], className: match[2] }))
}

export const getPublicElementEntries = () => {
	const indexSource = readFileSync(join(sourceRoot, 'index.ts'), 'utf8')
	const componentModules = [
		...indexSource.matchAll(/export\s+\*\s+from\s+['"]\.\/components\/([^'"]+)['"]/g)
	].map((match) => match[1])
	const publicComponentFiles = new Set(componentModules.map((name) => join(sourceRoot, 'components', `${name}.tsx`)))
	const entries = []

	for (const sourceFile of publicComponentFiles) {
		const definitions = definitionsIn(sourceFile)
		if (definitions.length > 1) {
			throw new Error(`${sourceFile} defines multiple public elements; give each tag an entry in src/elements`)
		}
		for (const definition of definitions) {
			entries.push({ ...definition, entryFile: sourceFile, sourceFile })
		}
	}

	const elementDir = join(sourceRoot, 'elements')
	if (existsSync(elementDir)) {
		for (const name of readdirSync(elementDir).filter((entry) => entry.endsWith('.ts')).sort()) {
			const entryFile = join(elementDir, name)
			const source = readFileSync(entryFile, 'utf8')
			const definitions = definitionsIn(entryFile)
			const componentImport = source.match(/from\s+['"]\.\.\/components\/([^'"]+)['"]/)?.[1]
			if (!componentImport || definitions.length !== 1) {
				throw new Error(`${name} must import one component module and define one element`)
			}

			const sourceFile = join(sourceRoot, 'components', `${componentImport}.tsx`)
			if (!publicComponentFiles.has(sourceFile)) throw new Error(`${name} points to a non-public component module`)
			entries.push({ ...definitions[0], entryFile, sourceFile })
		}
	}

	entries.sort((a, b) => a.tag.localeCompare(b.tag))
	const tags = entries.map((entry) => entry.tag)
	const duplicates = tags.filter((tag, index) => tags.indexOf(tag) !== index)
	if (duplicates.length) throw new Error(`Duplicate public element entries: ${[...new Set(duplicates)].join(', ')}`)

	return entries.map((entry) => ({
		...entry,
		entryFile: resolve(entry.entryFile),
		sourceFile: resolve(entry.sourceFile)
	}))
}
