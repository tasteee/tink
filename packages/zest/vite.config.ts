import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Builds the standalone, self-contained component library.
//
//   dist/zest.js   — every <z-*> custom element, with atomico + highlight.js +
//                    lowlight bundled in. Importing it self-registers all
//                    elements (each component calls customElements.define).
//   dist/ink.css   — the document-level design tokens (custom properties +
//                    fonts) extracted from src/ink.css. Consumers import this
//                    separately: `import '@tasteee/zest/ink.css'`.
//
// Nothing is externalized on purpose: the published package ships as one
// drop-in bundle with zero runtime dependencies.
export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'Zest',
			fileName: () => 'zest.js',
			formats: ['es']
		},
		rollupOptions: {
			output: {
				assetFileNames: 'ink.[ext]'
			}
		}
	}
})
