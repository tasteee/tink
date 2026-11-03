import axe from 'axe-core'
import type { AxeResults, Result, RunOptions } from 'axe-core'

/*
 * axe-core, run inside the test browser against real rendered DOM. Shadow
 * roots are walked by axe itself, so a Zest element is audited inside and
 * out. `expectNoA11yViolations` throws with a readable list, so a failing
 * test says which rule, on which node, and how to fix it.
 */

const describeViolation = (violation: Result): string => {
	const targets = violation.nodes.map((node) => node.target.flat().join(' ')).join(', ')
	// Contrast failures carry the measured colours; nothing else explains them.
	const details = violation.nodes.map((node) => node.any[0]?.data).filter(Boolean).map((data) => JSON.stringify(data)).join('\n    ')
	return `${violation.id} (${violation.impact ?? 'impact unknown'}): ${violation.help}\n    nodes: ${targets}\n    ${details}\n    ${violation.helpUrl}`
}

export const runAxe = async (root: Element | Document = document, options: RunOptions = {}): Promise<AxeResults> => {
	return axe.run(root, { resultTypes: ['violations'], ...options })
}

export const expectNoA11yViolations = async (root: Element | Document = document, options: RunOptions = {}): Promise<void> => {
	const results = await runAxe(root, options)
	if (results.violations.length === 0) return
	throw new Error(`Accessibility violations:\n  ${results.violations.map(describeViolation).join('\n  ')}`)
}
