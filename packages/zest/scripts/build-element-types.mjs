import { mkdirSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { getPublicElementEntries, projectRoot } from './public-element-entries.mjs'

const outputDir = join(projectRoot, 'dist', 'elements')
mkdirSync(outputDir, { recursive: true })

const entries = getPublicElementEntries()
for (const { tag, className, sourceFile } of entries) {
	const componentModule = basename(sourceFile, '.tsx')
	writeFileSync(join(outputDir, `${tag}.d.ts`), `export { ${className} } from '../components/${componentModule}'\n`)
}

console.log(`element declarations: ${entries.length} subpaths`)
