// A backtick inside a css`` template terminates the template, and the failure
// surfaces as an unrelated syntax error dozens of lines away. Writing prose
// comments in a stylesheet makes it easy to reach for one out of habit, so
// this catches it directly.
//
// Run: node scripts/check-css-templates.mjs

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const sourceDirectory = join(scriptDirectory, '..', 'src')

const sourceFiles = []
const walk = (directory) => {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name)
		if (entry.isDirectory()) walk(path)
		else if (/\.tsx?$/.test(entry.name)) sourceFiles.push(path)
	}
}
walk(sourceDirectory)

const physicalSpacing = /(^|[\s;{])(margin|padding|border)-(left|right)(-(color|width|style))?\s*:|(^|[\s;{])border-(top|bottom)-(left|right)-radius\s*:|text-align\s*:\s*(left|right)/
const physicalInset = /(^|[\s;{])(left|right)\s*:/
const coreFiles = new Set(['z-button', 'z-button-group', 'z-input', 'z-textarea', 'z-number-input', 'z-checkbox', 'z-switch', 'z-radio', 'z-radio-group', 'z-select', 'z-combobox', 'z-field', 'z-dialog', 'z-popover', 'z-tooltip', 'z-menu', 'z-tabs', 'z-table', 'z-toaster', 'z-alert'].map((tag) => `${tag}.tsx`))

const problems = []

for (const file of sourceFiles) {
	const lines = readFileSync(file, 'utf8').split('\n')
	let isInsideTemplate = false

	for (const [index, line] of lines.entries()) {
		if (!isInsideTemplate) {
			if (/(?:css|keyframes)`/.test(line)) isInsideTemplate = true
			continue
		}

		// The closing line of a css template is a backtick with an optional semicolon.
		if (/^`;?$/.test(line.trim())) {
			isInsideTemplate = false
			continue
		}

		if (line.includes('`')) {
			problems.push({ file, line: index + 1, text: line.trim(), reason: 'backtick inside a css`` template silently ends the template' })
		}

		// One focus treatment. `--ring` is the pre-unification token; every
		// focus outline goes through `--focus-ring` (see shared/interaction-styles.ts).
		if (/var\(--ring\)/.test(line)) {
			problems.push({ file, line: index + 1, text: line.trim(), reason: 'uses var(--ring); focus styling goes through var(--focus-ring)' })
		}

		// Direction-relative spacing is written logically so RTL flips it:
		// margin-inline-start, not margin-left. `left` / `right` insets are
		// allowed only in the overlay code that positions from measured rects,
		// marked `/* physical */` on the line or the one above; that check is
		// scoped to the core set until the long tail gets the same review.
		if (physicalSpacing.test(line)) {
			problems.push({ file, line: index + 1, text: line.trim(), reason: 'physical property; use the inline-start / inline-end (or start-start radius) form' })
		}
		const isCoreFile = coreFiles.has(basename(file))
		const previous = lines[index - 1] ?? ''
		if (isCoreFile && physicalInset.test(line) && !/physical/.test(line) && !/physical/.test(previous)) {
			problems.push({ file, line: index + 1, text: line.trim(), reason: 'left/right inset in a core element; use inset-inline-start/end, or mark it /* physical */ when the overlay engine positions it' })
		}
	}
}

if (problems.length === 0) {
	console.log(`css templates: clean (${sourceFiles.length} files)`)
	process.exit(0)
}

console.error('css template problems:')
for (const problem of problems) {
	console.error(`  ${problem.file}:${problem.line}  ${problem.text}
    ${problem.reason}`)
}
process.exit(1)
