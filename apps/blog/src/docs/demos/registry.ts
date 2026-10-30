import * as zest from '@tasteee/zest'

/*
 * Demo files. Every live example in the docs is a folder-free pair of files
 * under demos/: `<page>/<name>.html` (+ optional `.js` and `.css`). The same
 * text is both rendered into the preview and shown in the code view, so the
 * code a reader copies is exactly the code that's running.
 *
 * Scripts are written as ordinary page code (`document.querySelector`,
 * `import { toaster } from '@tasteee/zest'`). They run with `document`
 * scoped to their own preview, so two demos on one page can both say
 * `document.querySelector('#open')` without ever touching each other's
 * elements.
 */

const files = import.meta.glob('./**/*.{html,js,css}', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>

export type DemoFileT = { name: string; language: string; code: string }
export type DemoT = { id: string; html: string; js?: string; css?: string; files: DemoFileT[] }

const cache = new Map<string, DemoT>()

export const getDemo = (id: string): DemoT | undefined => {
	const cached = cache.get(id)
	if (cached) return cached
	const html = files[`./${id}.html`]
	if (html == null) return undefined
	const js = files[`./${id}.js`]
	const css = files[`./${id}.css`]
	const demoFiles: DemoFileT[] = [{ name: 'index.html', language: 'html', code: html }]
	if (js) demoFiles.push({ name: 'main.js', language: 'js', code: js })
	if (css) demoFiles.push({ name: 'styles.css', language: 'css', code: css })
	const demo = { id, html, js, css, files: demoFiles }
	cache.set(id, demo)
	return demo
}

const ZEST_IMPORT = /^\s*import\s*\{([^}]*)\}\s*from\s*['"]@tasteee\/zest['"];?\s*$/gm

// `document`, narrowed to one preview: lookups only see that preview's
// elements, everything else (createElement, addEventListener, …) is the real one.
const scopeDocument = (stage: HTMLElement): Document =>
	new Proxy(document, {
		get(target, key) {
			if (key === 'querySelector') return (selector: string) => stage.querySelector(selector)
			if (key === 'querySelectorAll') return (selector: string) => stage.querySelectorAll(selector)
			if (key === 'getElementById') return (id: string) => stage.querySelector(`#${CSS.escape(id)}`)
			const value = Reflect.get(target, key, target)
			return typeof value === 'function' ? value.bind(target) : value
		}
	})

/** Run a demo script against its preview element. */
export const runDemoScript = (code: string, stage: HTMLElement): void => {
	const names: string[] = []
	const body = code.replace(ZEST_IMPORT, (_, list: string) => {
		names.push(...list.split(',').map((name) => name.trim()).filter(Boolean))
		return ''
	})
	const prelude = names.length ? `const { ${names.join(', ')} } = zest;\n` : ''
	try {
		new Function('document', 'zest', prelude + body)(scopeDocument(stage), zest)
	} catch (error) {
		console.error(`[docs] demo script failed`, error)
	}
}
