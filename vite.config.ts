import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// The unified site — home + blog + docs — is a single React SPA.
//
// It consumes the COMPILED component library from ../dist (the Atomico web
// components, built by `vite build --config vite.lib.config.ts --watch`). The
// library's Atomico JSX world therefore never enters this React build graph, so
// the two JSX runtimes can't collide.
//
//   npm run dev  -> runs three things together (see package.json):
//                     1. library build in --watch mode  (writes ../dist)
//                     2. this Vite dev server           (the SPA)
//                     3. convex dev                      (the blog backend)
export default defineConfig({
	root: resolve(__dirname, 'app'),
	// .env.local (VITE_CONVEX_URL, written by `convex dev`) lives in wc/, but the
	// Vite root is wc/app/, so point envDir back at wc/ to pick it up.
	envDir: resolve(__dirname),
	plugins: [react()],
	server: {
		port: 5173,
		// app/ imports the built ../dist/zesty-wc.{js,css}, which live outside root.
		fs: { allow: [resolve(__dirname)] }
	},
	resolve: {
		// pnpm's symlinked layout + the non-default root can pre-bundle React along
		// two paths, yielding "more than one copy of React". Force a single instance.
		dedupe: ['react', 'react-dom'],
		alias: {
			'@app': resolve(__dirname, 'app/src'),
			'@zest': resolve(__dirname, 'dist'),
			'@convex': resolve(__dirname, 'convex')
		}
	},
	build: {
		outDir: resolve(__dirname, 'dist-app'),
		emptyOutDir: true
	}
})
