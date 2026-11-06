// Installs the packed @tasteee/zest tarball into clean projects the way a user
// would, builds each one, and drives it in Chromium. It proves what unit tests
// cannot: that the published package, not the workspace source, imports, types,
// bundles and runs in plain HTML, React + TypeScript, Vue 3 and Svelte 5.
//
//   node scripts/consumer-smoke.mjs              all four
//   node scripts/consumer-smoke.mjs plain react  only those
//
// Each project renders a <z-switch>, flips it with a real click, and checks the
// framework's own event binding saw the change. It needs the package built
// (`pnpm build`), Chromium (`playwright install chromium`) and the npm registry.

import { execFileSync } from 'node:child_process'
import { createReadStream, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const here = dirname(fileURLToPath(import.meta.url))
const packageRoot = join(here, '..')
const requested = process.argv.slice(2)
const allScenarios = ['plain', 'react', 'vue', 'svelte']
const scenarios = requested.length ? requested : allScenarios

const workDir = mkdtempSync(join(tmpdir(), 'zest-consumer-'))
const failures = []

const run = (command, args, options = {}) => {
	return execFileSync(command, args, { stdio: 'pipe', encoding: 'utf8', ...options })
}

const write = (dir, file, text) => {
	const path = join(dir, file)
	mkdirSync(dirname(path), { recursive: true })
	writeFileSync(path, text)
}

// --- the tarball ---------------------------------------------------------------

const packTarball = () => {
	const output = run('npm', ['pack', '--pack-destination', workDir, '--silent'], { cwd: packageRoot })
	const name = output.trim().split('\n').pop()
	return join(workDir, name)
}

// --- a static server -----------------------------------------------------------

const contentTypes = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.mjs': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.woff2': 'font/woff2',
	'.svg': 'image/svg+xml'
}

const serve = (rootDir) => {
	const server = createServer((request, response) => {
		const urlPath = decodeURIComponent((request.url ?? '/').split('?')[0])
		const safePath = normalize(urlPath).replace(/^(\.\.[/\\])+/, '')
		let filePath = join(rootDir, safePath)
		const isDirectory = existsSync(filePath) && statSync(filePath).isDirectory()
		if (isDirectory) filePath = join(filePath, 'index.html')
		if (!existsSync(filePath)) {
			response.writeHead(404)
			response.end('not found')
			return
		}
		response.writeHead(200, { 'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream' })
		createReadStream(filePath).pipe(response)
	})
	return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)))
}

// --- the browser check ---------------------------------------------------------

// Loads the page, clicks the switch, and reads what the framework recorded.
const driveBrowser = async (browser, rootDir, label) => {
	const server = await serve(rootDir)
	const port = server.address().port
	const page = await browser.newPage()
	const problems = []
	page.on('pageerror', (error) => problems.push(`page error: ${error.message}`))
	page.on('console', (message) => {
		if (message.type() === 'error') problems.push(`console error: ${message.text()}`)
	})
	page.on('requestfailed', (request) => problems.push(`request failed: ${request.url()}`))

	try {
		await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' })
		await page.waitForSelector('z-switch')
		const upgrade = await page.evaluate(() => ({
			isDefined: Boolean(customElements.get('z-switch')),
			hasShadow: Boolean(document.querySelector('z-switch')?.shadowRoot),
			hasTokens: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim().length > 0
		}))
		if (!upgrade.isDefined) problems.push('z-switch is not defined')
		if (!upgrade.hasShadow) problems.push('z-switch rendered no shadow root')
		if (!upgrade.hasTokens) problems.push('ink.css tokens are missing (--primary is empty)')

		await page.locator('z-switch').click()
		await page.waitForTimeout(150)
		const recorded = await page.evaluate(() => document.querySelector('#count')?.textContent?.trim())
		const switchIsOn = await page.evaluate(() => Boolean(document.querySelector('z-switch')?.isChecked))
		if (recorded !== '1') problems.push(`the ${label} event handler saw "${recorded}" changes, expected "1"`)
		if (!switchIsOn) problems.push('the switch did not turn on after a click')
	} finally {
		await page.close()
		server.close()
	}
	return problems
}

// --- one project ---------------------------------------------------------------

const createProject = (name, packageJson) => {
	const dir = join(workDir, name)
	mkdirSync(dir, { recursive: true })
	write(dir, 'package.json', JSON.stringify({ name: `consumer-${name}`, private: true, type: 'module', ...packageJson }, null, 2))
	return dir
}

const install = (dir, tarball, extra = []) => {
	run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error', tarball, ...extra], { cwd: dir })
}

const reportProblems = (name, problems) => {
	const status = problems.length ? 'FAIL' : 'ok'
	console.log(`  ${status}  ${name}`)
	for (const problem of problems) console.log(`        - ${problem}`)
	for (const problem of problems) failures.push(`${name}: ${problem}`)
}

// --- scenarios -----------------------------------------------------------------

// The page every project shares. `count` is where a framework writes how many
// change events it saw; a project that renders its own #count leaves it out.
const pageHtml = (page) => `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<title>consumer</title>
	${page.css ? `<link rel="stylesheet" href="${page.css}" />` : ''}
</head>
<body>
	<div id="app">${page.body ?? ''}</div>
	${page.hasOwnCount ? '' : '<p id="count">0</p>'}
	${page.tail ?? ''}
</body>
</html>
`

const scenarioPlain = async (browser, tarball) => {
	const dir = createProject('plain', {})
	install(dir, tarball)
	write(dir, 'index.html', pageHtml({
		css: './node_modules/@tasteee/zest/dist/ink.css',
		body: '<z-switch label="Dark mode"></z-switch>',
		tail: `<script type="module">
			import './node_modules/@tasteee/zest/dist/zest.js'
			let count = 0
			document.querySelector('z-switch').addEventListener('change', () => {
				count += 1
				document.querySelector('#count').textContent = String(count)
			})
		</script>`
	}))
	return driveBrowser(browser, dir, 'plain DOM')
}

const scenarioReact = async (browser, tarball) => {
	const dir = createProject('react', { scripts: { build: 'vite build' } })
	install(dir, tarball, ['react@^19', 'react-dom@^19', '@types/react@^19', '@types/react-dom@^19', 'typescript@^5', 'vite@^6', '@vitejs/plugin-react@^4'])
	write(dir, 'vite.config.ts', "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\nexport default defineConfig({ plugins: [react()] })\n")
	write(dir, 'tsconfig.json', JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'bundler', jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: false, types: ['@tasteee/zest/react'] }, include: ['src'] }))
	write(dir, 'index.html', pageHtml({ hasOwnCount: true, tail: '<script type="module" src="/src/main.tsx"></script>' }))
	write(dir, 'src/main.tsx', `import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@tasteee/zest'
import '@tasteee/zest/ink.css'

const App = () => {
	const [count, setCount] = useState(0)
	const handleChange = (): void => setCount(count + 1)
	return (
		<>
			<z-switch label="Dark mode" onchange={handleChange}></z-switch>
			<z-button kind="solid" tone="primary" size="md">Save</z-button>
			<p id="count">{count}</p>
		</>
	)
}

createRoot(document.querySelector('#app')!).render(<App />)
`)
	const problems = []

	try {
		run('npx', ['tsc', '--noEmit', '-p', 'tsconfig.json'], { cwd: dir })
	} catch (error) {
		problems.push(`the typings reject correct usage:\n${error.stdout ?? error.message}`)
	}

	// Wrong values must be a type error, not silently accepted.
	write(dir, 'negative/bad.tsx', `export const Bad = () => (
	<>
		<z-button kind="huge">x</z-button>
		<z-switch tone="purple"></z-switch>
	</>
)
`)
	write(dir, 'tsconfig.negative.json', JSON.stringify({ extends: './tsconfig.json', include: ['negative'] }))
	let negativeOutput = ''
	try {
		run('npx', ['tsc', '--noEmit', '-p', 'tsconfig.negative.json'], { cwd: dir })
	} catch (error) {
		negativeOutput = String(error.stdout ?? '')
	}
	// TypeScript quotes a rejected string literal as '"huge"'.
	if (!negativeOutput.includes('"huge"')) problems.push(`the typings accept kind="huge" on z-button. tsc said: ${negativeOutput.slice(0, 300) || '(nothing)'}`)
	if (!negativeOutput.includes('"purple"')) problems.push(`the typings accept tone="purple" on z-switch. tsc said: ${negativeOutput.slice(0, 300) || '(nothing)'}`)

	run('npx', ['vite', 'build'], { cwd: dir })
	problems.push(...(await driveBrowser(browser, join(dir, 'dist'), 'React')))
	return problems
}

const scenarioVue = async (browser, tarball) => {
	const dir = createProject('vue', { scripts: { build: 'vite build' } })
	install(dir, tarball, ['vue@^3', 'vite@^6', '@vitejs/plugin-vue@^5'])
	write(dir, 'vite.config.js', `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
	plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('z-') } } })]
})
`)
	write(dir, 'index.html', pageHtml({ hasOwnCount: true, tail: '<script type="module" src="/src/main.js"></script>' }))
	write(dir, 'src/main.js', `import { createApp } from 'vue'
import '@tasteee/zest'
import '@tasteee/zest/ink.css'
import App from './App.vue'
createApp(App).mount('#app')
`)
	write(dir, 'src/App.vue', `<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
<template>
	<z-switch label="Dark mode" @change="count += 1"></z-switch>
	<z-button kind="solid" tone="primary">Save</z-button>
	<p id="count">{{ count }}</p>
</template>
`)
	run('npx', ['vite', 'build'], { cwd: dir })
	return driveBrowser(browser, join(dir, 'dist'), 'Vue')
}

const scenarioSvelte = async (browser, tarball) => {
	const dir = createProject('svelte', { scripts: { build: 'vite build' } })
	install(dir, tarball, ['svelte@^5', 'vite@^6', '@sveltejs/vite-plugin-svelte@^5'])
	write(dir, 'vite.config.js', "import { defineConfig } from 'vite'\nimport { svelte } from '@sveltejs/vite-plugin-svelte'\nexport default defineConfig({ plugins: [svelte()] })\n")
	write(dir, 'svelte.config.js', "import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'\nexport default { preprocess: vitePreprocess() }\n")
	write(dir, 'index.html', pageHtml({ hasOwnCount: true, tail: '<script type="module" src="/src/main.js"></script>' }))
	write(dir, 'src/main.js', `import { mount } from 'svelte'
import '@tasteee/zest'
import '@tasteee/zest/ink.css'
import App from './App.svelte'
mount(App, { target: document.querySelector('#app') })
`)
	write(dir, 'src/App.svelte', `<script>
	let count = $state(0)
</script>

<z-switch label="Dark mode" onchange={() => (count += 1)}></z-switch>
<z-button kind="solid" tone="primary">Save</z-button>
<p id="count">{count}</p>
`)
	run('npx', ['vite', 'build'], { cwd: dir })
	return driveBrowser(browser, join(dir, 'dist'), 'Svelte')
}

const scenarioRunners = { plain: scenarioPlain, react: scenarioReact, vue: scenarioVue, svelte: scenarioSvelte }

// --- main ----------------------------------------------------------------------

const main = async () => {
	if (!existsSync(join(packageRoot, 'dist', 'zest.js'))) throw new Error('Build the package first: pnpm build')
	const unknown = scenarios.filter((name) => !scenarioRunners[name])
	if (unknown.length) throw new Error(`Unknown scenario: ${unknown.join(', ')}. Choose from ${allScenarios.join(', ')}.`)

	console.log('packing @tasteee/zest')
	const tarball = packTarball()
	const browser = await chromium.launch()
	console.log(`consumer smoke test: ${scenarios.join(', ')}`)

	try {
		for (const name of scenarios) {
			try {
				const problems = await scenarioRunners[name](browser, tarball)
				reportProblems(name, problems)
			} catch (error) {
				reportProblems(name, [`could not run: ${String(error.stderr || error.stdout || error.message).slice(0, 800)}`])
			}
		}
	} finally {
		await browser.close()
		rmSync(workDir, { recursive: true, force: true })
	}

	if (failures.length) {
		console.error(`\n${failures.length} problem(s)`)
		process.exit(1)
	}
	console.log('\nevery consumer works')
}

main().catch((error) => {
	console.error(error.message)
	process.exit(1)
})
