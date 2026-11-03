import { existsSync } from 'node:fs'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

// Two projects share one config:
//
//   unit     — happy-dom. Fast registration, mount and event-contract checks.
//              happy-dom has no ElementInternals, so anything about forms is
//              a no-op there and belongs in the browser project.
//   browser  — a real Chromium through Playwright. Form participation,
//              constraint validation, focus and anything else that needs the
//              platform rather than a simulation.
//
// `npm test` runs both. `npm run test:unit` / `npm run test:browser` pick one.

// Which Chromium drives the browser project. CI installs Playwright's own
// (`npx playwright install --with-deps chromium`). On Windows the installed
// Edge is used instead, so a fresh clone needs no 200 MB download to run the
// suite. ZEST_BROWSER_CHANNEL=chromium|chrome|msedge overrides either.
const edgePaths = [
	'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
	'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
]
const hasEdge = process.platform === 'win32' && edgePaths.some((path) => existsSync(path))
const browserChannel = process.env.ZEST_BROWSER_CHANNEL ?? (hasEdge ? 'msedge' : 'chromium')

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: 'unit',
					environment: 'happy-dom',
					include: ['src/_tests/**/*.test.ts'],
					exclude: ['src/_tests/browser/**']
				}
			},
			{
				// Pre-bundle Atomico up front: discovering it mid-run makes Vite
				// reload the page and drop whichever files were importing.
				optimizeDeps: { include: ['atomico', 'atomico/jsx-runtime', 'atomico/jsx-dev-runtime', 'axe-core', 'marked', 'lowlight', 'highlight.js'] },
				test: {
					name: 'browser',
					include: ['src/_tests/browser/**/*.test.ts'],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({ launchOptions: { channel: browserChannel, executablePath: process.env.ZEST_BROWSER_PATH || undefined } }),
						instances: [{ browser: 'chromium' }]
					}
				}
			}
		],
		coverage: {
			provider: 'v8',
			include: ['src/components/**/*.tsx'],
			reporter: ['text', 'html'],
			// Two bars. The catalog-wide one only stops a slide; the core-set one
			// is the line behaviour tests have to hold — a change to a core
			// element that removes its tests fails here, not in review.
			thresholds: {
				statements: 40,
				branches: 30,
				functions: 30,
				lines: 40,
				'src/components/{z-button,z-button-group,z-input,z-textarea,z-number-input,z-checkbox,z-switch,z-radio,z-radio-group,z-select,z-combobox,z-field,z-dialog,z-popover,z-tooltip,z-menu,z-tabs,z-table,z-table-toolbar,z-toast,z-alert}.tsx': {
					statements: 80,
					branches: 65,
					functions: 70,
					lines: 85
				}
			}
		}
	}
})
