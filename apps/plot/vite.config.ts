import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// plot: mobile-first 3D lot builder. React + react-three-fiber,
// with the compiled @tasteee/zest web components for the HUD.
//
// The site build (root `pnpm build`) ships this app inside the
// main site at <site base>/plot/, so production builds use that
// base. VITE_BASE_PATH is the site base (e.g. /tink/ on Pages).
const getSiteBase = (): string => {
	const siteBase = process.env.VITE_BASE_PATH ?? '/'
	const hasTrailingSlash = siteBase.endsWith('/')
	if (hasTrailingSlash) return siteBase
	return `${siteBase}/`
}

export default defineConfig((environment) => {
	const isBuild = environment.command === 'build'
	const base = isBuild ? `${getSiteBase()}plot/` : '/'

	return {
		base,
		root: resolve(__dirname),
		plugins: [react()],
		server: {
			port: 5177,
			host: true,
			fs: { allow: [resolve(__dirname, '../..')] }
		},
		resolve: {
			dedupe: ['react', 'react-dom', 'three']
		},
		build: {
			outDir: resolve(__dirname, 'dist'),
			emptyOutDir: true,
			chunkSizeWarningLimit: 2000
		}
	}
})
