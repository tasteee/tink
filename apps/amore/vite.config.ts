import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'
import { resolve } from 'node:path'

// amore — the chord-progression-driven pattern sequencer. A SolidJS SPA that
// consumes the COMPILED @tasteee/zest component library (packages/zest/dist),
// same as the blog app, and shares the repo-root Convex backend (convex/).
export default defineConfig({
	root: resolve(__dirname),
	// .env.local (VITE_CONVEX_URL) lives at the repo root, not here.
	envDir: resolve(__dirname, '../..'),
	plugins: [solid()],
	server: {
		port: 5175,
		fs: { allow: [resolve(__dirname, '../..')] }
	},
	resolve: {
		dedupe: ['solid-js'],
		alias: {
			'@amore': resolve(__dirname, 'src'),
			'@convex': resolve(__dirname, '../../convex')
		}
	},
	build: {
		outDir: resolve(__dirname, 'dist'),
		emptyOutDir: true
	}
})
