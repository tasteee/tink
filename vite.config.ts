import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// The site (home + tools) is a single React SPA. It consumes the COMPILED
// component library from the @tasteee/zest package (installed from GitHub and
// built on install), so the library's Atomico JSX world never enters this
// React build graph. The Zest docs live in the zest repo, not here.
export default defineConfig({
	// GitHub Pages serves project sites from /<repo>/. Everywhere else is /.
	base: process.env.VITE_BASE_PATH ?? '/',
	root: resolve(__dirname, 'apps/blog'),
	plugins: [react()],
	server: {
		port: 5173,
		// apps/blog/ imports @tasteee/zest from node_modules, which resolves
		// outside the app root.
		fs: { allow: [resolve(__dirname)] }
	},
	resolve: {
		// pnpm's symlinked layout + the non-default root can pre-bundle React along
		// two paths, yielding "more than one copy of React". Force a single instance.
		dedupe: ['react', 'react-dom'],
		alias: {
			'@app': resolve(__dirname, 'apps/blog/src')
		}
	},
	build: {
		outDir: resolve(__dirname, 'apps/blog/dist'),
		emptyOutDir: true
	}
})
