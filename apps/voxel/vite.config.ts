import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'node:path'

// voxel: first-person voxel editor. Svelte 5 + Threlte,
// with the compiled @tasteee/zest web components for all UI.
//
// The site build (root `pnpm build`) ships this app inside
// the main site at <site base>/voxel/. VITE_BASE_PATH is the
// site base (e.g. /tink/ on Pages).
const getSiteBase = (): string => {
	const siteBase = process.env.VITE_BASE_PATH ?? '/'
	const hasTrailingSlash = siteBase.endsWith('/')
	if (hasTrailingSlash) return siteBase
	return `${siteBase}/`
}

export default defineConfig((environment) => {
	const isBuild = environment.command === 'build'
	const base = isBuild ? `${getSiteBase()}voxel/` : '/'

	return {
		base,
		root: resolve(__dirname),
		plugins: [svelte()],
		server: {
			port: 5178,
			host: true,
			fs: { allow: [resolve(__dirname, '../..')] }
		},
		resolve: {
			dedupe: ['three']
		},
		build: {
			outDir: resolve(__dirname, 'dist'),
			emptyOutDir: true,
			chunkSizeWarningLimit: 2500
		}
	}
})
