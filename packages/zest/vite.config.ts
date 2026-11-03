import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { getPublicElementEntries } from './scripts/public-element-entries.mjs'

const elementEntries = Object.fromEntries(
	getPublicElementEntries().map(({ tag, entryFile }) => [`elements/${tag}`, entryFile])
)

// Builds both package entry styles from the same public element inventory.
//
//   dist/zest.js: every z custom element, with atomico + highlight.js +
//                    lowlight bundled in. Importing it self-registers all
//                    public elements.
//   dist/elements/, one entry per element. Importing z-button.js registers
//                    z-button and no other custom element.
//   dist/ink.css  , the document-level design tokens (custom properties +
//                    fonts) extracted from src/ink.css. Consumers import this
//                    separately: `import '@tasteee/zest/ink.css'`.
export default defineConfig({
	build: {
		lib: {
			entry: {
				zest: resolve(__dirname, 'src/index.ts'),
				...elementEntries
			},
			name: 'Zest',
			formats: ['es']
		},
		rollupOptions: {
			output: {
				entryFileNames: '[name].js',
				chunkFileNames: 'chunks/[name]-[hash].js',
				assetFileNames: 'ink.[ext]'
			}
		}
	}
})
