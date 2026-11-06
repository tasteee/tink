// Crawls the built docs site in Chromium and fails on anything a reader would
// trip over. Run it after `pnpm build`:
//
//   node scripts/check-docs.mjs
//
// For every page it reaches by following links, it checks that:
//   - nothing logs a console error or warning, throws, or fails to load, and
//     every request that answers 4xx or 5xx is named;
//   - every z-* tag on the page is a registered element, and none is held back;
//   - the page is not the 404 page, is not empty, and does not scroll sideways
//     on a phone.
// Every live example is audited with axe, and the docs' source is scanned for
// corrupted text and for imports that would bypass the built package.
// It also opens the ⌘K search and checks that no entry names a held-back
// element and that every entry leads to a page that exists.

import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { heldBackTags } from '../packages/zest/scripts/held-back.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js')
const distDir = join(here, '..', 'apps', 'blog', 'dist')
const heldBack = new Set(heldBackTags)

const manifest = JSON.parse(readFileSync(join(here, '..', 'packages', 'zest', 'custom-elements.json'), 'utf8'))
const publicElements = manifest.modules.flatMap((module) => module.declarations ?? []).filter((declaration) => declaration.customElement)

const contentTypes = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.woff2': 'font/woff2',
	'.woff': 'font/woff',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.mp4': 'video/mp4'
}

// Serves dist the way a static host with a single-page fallback does.
const serve = () => {
	const server = createServer((request, response) => {
		const urlPath = decodeURIComponent((request.url ?? '/').split('?')[0])
		const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
		let filePath = join(distDir, safePath)
		const isDirectory = existsSync(filePath) && statSync(filePath).isDirectory()
		if (isDirectory) filePath = join(filePath, 'index.html')
		const isFile = existsSync(filePath) && statSync(filePath).isFile()
		// A page address falls back to the app shell. A missing file does not:
		// a real host answers 404 there, and so must this, or a broken asset
		// link would pass.
		const isPageAddress = extname(safePath) === '' || safePath.endsWith('/')
		if (!isFile && !isPageAddress) {
			response.writeHead(404)
			response.end('not found')
			return
		}
		if (!isFile) filePath = join(distDir, 'index.html')
		response.writeHead(200, { 'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream' })
		createReadStream(filePath).pipe(response)
	})
	return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)))
}

const issues = []
const report = (route, message) => issues.push(`${route}  ${message}`)

const isInternalPage = (href) => {
	const isPath = href.startsWith('/') && !href.startsWith('//')
	if (!isPath) return false
	const withoutHash = href.split('#')[0]
	const isAsset = /\.(png|jpe?g|svg|mp4|webp|ico|css|js|json|woff2?)$/.test(withoutHash)
	return !isAsset
}

// Everything the page renders, shadow roots included.
const inspectPage = (heldBackList) => {
	const tags = new Set()
	const walk = (root) => {
		for (const element of root.querySelectorAll('*')) {
			if (element.localName.startsWith('z-')) tags.add(element.localName)
			if (element.shadowRoot) walk(element.shadowRoot)
		}
	}
	walk(document)
	const all = [...tags]
	const bodyText = document.body.innerText
	const apiSections = [...document.querySelectorAll('section.apiReference')].map((section) => ({
		label: section.getAttribute('aria-label') ?? '',
		groups: [...section.querySelectorAll('.apiGroupTitle')].map((title) => (title.firstChild?.textContent ?? '').trim())
	}))
	return {
		apiSections,
		undefinedTags: all.filter((tag) => !customElements.get(tag)),
		heldBackTags: all.filter((tag) => heldBackList.includes(tag)),
		isNotFound: /Page not found|That page doesn.t exist/i.test(bodyText),
		textLength: bodyText.length,
		scrollWidth: document.documentElement.scrollWidth,
		innerWidth: window.innerWidth
	}
}

const apiSectionsByTag = new Map()

const checkRoute = async (browser, base, route) => {
	const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
	const page = await context.newPage()

	page.on('console', (message) => {
		if (['error', 'warning'].includes(message.type())) report(route, `console ${message.type()}: ${message.text().slice(0, 200)}`)
	})
	page.on('pageerror', (error) => report(route, `uncaught error: ${error.message.slice(0, 200)}`))
	page.on('requestfailed', (request) => {
		const isAborted = request.failure()?.errorText === 'net::ERR_ABORTED'
		if (!isAborted) report(route, `request failed: ${request.url()} (${request.failure()?.errorText})`)
	})
	page.on('response', (response) => {
		if (response.status() >= 400) report(route, `HTTP ${response.status()}: ${response.url()}`)
	})

	await page.goto(`${base}${route}`, { waitUntil: 'load' })
	// A page that streams video never goes idle, so the wait is bounded.
	await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => undefined)
	await page.waitForTimeout(250)

	const info = await page.evaluate(inspectPage, [...heldBack])
	for (const section of info.apiSections) {
		const tag = section.label.replace(/ API reference$/, '')
		apiSectionsByTag.set(tag, section.groups)
	}
	if (info.undefinedTags.length) report(route, `unregistered elements: ${info.undefinedTags.join(', ')}`)
	if (info.heldBackTags.length) report(route, `held-back elements on the page: ${info.heldBackTags.join(', ')}`)
	if (info.isNotFound) report(route, 'shows the 404 page')
	// Plot, Voxel and Vink are separate apps with their own interfaces, and the
	// /docs/x easter egg is a video player. Only the written pages need text.
	const isWrittenPage = route === '/' || route.startsWith('/docs') || route.startsWith('/tools')
	const isEasterEgg = route === '/docs/x'
	if (isWrittenPage && !isEasterEgg && info.textLength < 200) report(route, `almost empty (${info.textLength} characters)`)

	await page.setViewportSize({ width: 390, height: 800 })
	await page.waitForTimeout(150)
	const phone = await page.evaluate(() => {
		const scrollWidth = document.documentElement.scrollWidth
		const innerWidth = window.innerWidth
		const isOver = scrollWidth > innerWidth + 1
		if (!isOver) return { scrollWidth, innerWidth, culprits: [] }

		// Walk the composed tree: through slots and shadow roots, the way a
		// browser clips. An element or a line of text counts only if no ancestor
		// scrolls or clips it.
		const composedParent = (node) => node.assignedSlot || node.parentElement || (node.parentNode instanceof ShadowRoot ? node.parentNode.host : null)
		const isClipped = (node) => {
			for (let parent = composedParent(node); parent && parent !== document.body; parent = composedParent(parent)) {
				if (getComputedStyle(parent).overflowX !== 'visible') return true
			}
			return false
		}
		const name = (element) => `${element.localName}${element.className && typeof element.className === 'string' ? '.' + element.className.trim().split(/\s+/).join('.') : ''}`
		const found = []
		const walk = (root) => {
			for (const element of root.querySelectorAll('*')) {
				const box = element.getBoundingClientRect()
				if (box.width > 0 && box.right > innerWidth + 1 && !isClipped(element)) found.push({ right: box.right, text: `${name(element)} ends at ${Math.round(box.right)}px` })
				if (element.shadowRoot) walk(element.shadowRoot)
			}
			const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
			for (let node = walker.nextNode(); node; node = walker.nextNode()) {
				if (!node.textContent.trim()) continue
				const range = document.createRange()
				range.selectNodeContents(node)
				const box = range.getBoundingClientRect()
				const owner = node.parentElement
				if (owner && box.right > innerWidth + 1 && !isClipped(owner) && getComputedStyle(owner).overflowX === 'visible') {
					found.push({ right: box.right, text: `text "${node.textContent.trim().slice(0, 40)}" in ${name(owner)} ends at ${Math.round(box.right)}px` })
				}
			}
		}
		walk(document.body)
		const culprits = found.sort((a, b) => b.right - a.right).slice(0, 3).map((item) => item.text)
		return { scrollWidth, innerWidth, culprits }
	})
	if (phone.scrollWidth > phone.innerWidth + 1) report(route, `scrolls sideways on a phone (${phone.scrollWidth}px in ${phone.innerWidth}px): ${phone.culprits.join('; ')}`)

	await page.setViewportSize({ width: 1280, height: 900 })
	const canvasCount = await page.locator('.Example-canvas').count()
	if (canvasCount > 0) {
		await page.addScriptTag({ path: axePath })
		const violations = await page.evaluate(async () => {
			const found = []
			for (const canvas of document.querySelectorAll('.Example-canvas')) {
				// An example is a fragment inside a page, so rules about the page's own
				// outline and main landmark do not apply to it.
				const fragmentRules = ['heading-order', 'landmark-main-is-top-level', 'landmark-no-duplicate-main']
				const rules = Object.fromEntries(fragmentRules.map((id) => [id, { enabled: false }]))
				const results = await window.axe.run(canvas, { resultTypes: ['violations'], rules })
				for (const violation of results.violations) {
					found.push(`${violation.id} on ${violation.nodes.slice(0, 2).map((node) => node.target.flat().join(' ').slice(0, 70)).join(' | ')}`)
				}
			}
			return found
		})
		for (const violation of violations) report(route, `accessibility: ${violation}`)
	}

	const links = await page.$$eval('a[href]', (anchors) => anchors.map((anchor) => anchor.getAttribute('href')))
	await context.close()
	return links.filter(Boolean).filter(isInternalPage).map((href) => href.split('#')[0] || '/')
}

const checkSearch = async (browser, base, knownRoutes) => {
	const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
	const page = await context.newPage()
	await page.goto(`${base}/docs/setup/introduction`, { waitUntil: 'load' })
	await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => undefined)
	await page.keyboard.press('Control+k')
	await page.waitForTimeout(400)
	const entries = await page.$$eval('z-command-item', (items) =>
		items.map((item) => ({ value: item.getAttribute('value') ?? '', label: item.getAttribute('label') ?? '', keywords: item.getAttribute('keywords') ?? '' }))
	)
	await context.close()

	if (entries.length < 100) report('search', `only ${entries.length} entries; the palette did not load`)
	for (const entry of entries) {
		const text = `${entry.value} ${entry.label} ${entry.keywords}`
		const named = [...heldBack].filter((tag) => text.split(/[^a-z-]+/).includes(tag))
		if (named.length) report('search', `"${entry.label}" names held-back ${named.join(', ')}`)
		const route = `/docs/${entry.value}`
		if (!knownRoutes.has(route)) report('search', `"${entry.label}" leads to ${route}, which the crawl never reached`)
	}
	return entries.length
}

// Every public element has an API reference somewhere in the docs, and it has
// the sections that element needs. The manifest decides what it needs.
const checkElementPages = () => {
	for (const declaration of publicElements) {
		const groups = apiSectionsByTag.get(declaration.tagName)
		if (!groups) {
			report(declaration.tagName, 'has no API reference anywhere in the docs')
			continue
		}
		const needed = ['Keyboard', 'Accessibility']
		if ((declaration.attributes ?? []).length) needed.push('Properties')
		if ((declaration.events ?? []).length) needed.push('Events')
		if ((declaration.slots ?? []).length) needed.push('Slots')
		if ((declaration.cssProperties ?? []).length) needed.push('CSS custom properties')
		if ((declaration.cssParts ?? []).length) needed.push('CSS parts')
		const missing = needed.filter((title) => !groups.includes(title))
		if (missing.length) report(declaration.tagName, `API reference is missing: ${missing.join(', ')}`)
	}
}

// Text that was decoded in the wrong encoding and saved again turns "▣" into
// "â–£". It is invisible in an editor that guesses the encoding, and ugly in
// the browser, so the docs' source is scanned for it.
const mojibakePattern = /[\u00c3\u00c2\u00e2][\u0080-\u00bf\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u02c6\u02dc\u2013-\u203a\u20ac\u2122]/

const listFiles = (dir) => {
	const files = []
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) files.push(...listFiles(path))
		else files.push(path)
	}
	return files
}

const checkSource = () => {
	const sourceDir = join(here, '..', 'apps', 'blog', 'src')
	const textFiles = listFiles(sourceDir).filter((file) => /\.(html|js|css|tsx|ts|json|md)$/.test(file))
	for (const file of textFiles) {
		const relative = file.slice(sourceDir.length + 1)
		const text = readFileSync(file, 'utf8')
		if (mojibakePattern.test(text)) report(relative, 'contains corrupted characters (text saved in the wrong encoding)')
		// The docs run the built package, the way a user does. An import of the
		// library's source would show behaviour the published package does not have.
		const importsSource = /from\s+['"][^'"]*(packages\/zest\/src|@tasteee\/zest\/src)/.test(text)
		if (importsSource) report(relative, 'imports the library source instead of the built package')
	}
}

const main = async () => {
	checkSource()
	if (!existsSync(join(distDir, 'index.html'))) throw new Error('Build the site first: pnpm build')
	const server = await serve()
	const base = `http://127.0.0.1:${server.address().port}`
	const browser = await chromium.launch()

	const queue = ['/', '/docs/setup/introduction', '/docs/elements', '/docs/blocks']
	const seen = new Set()
	while (queue.length) {
		const route = queue.shift()
		if (seen.has(route)) continue
		seen.add(route)
		const links = await checkRoute(browser, base, route)
		for (const link of links) if (!seen.has(link)) queue.push(link)
	}

	checkElementPages()
	const searchCount = await checkSearch(browser, base, seen)
	await browser.close()
	server.close()

	console.log(`docs check: ${seen.size} pages, ${searchCount} search entries`)
	if (issues.length) {
		const unique = [...new Set(issues)]
		console.error(`\n${unique.length} problem(s):\n${unique.map((issue) => `  - ${issue}`).join('\n')}`)
		process.exit(1)
	}
	console.log('docs are clean')
}

main().catch((error) => {
	console.error(error.message)
	process.exit(1)
})
