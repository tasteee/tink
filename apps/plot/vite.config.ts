import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// plot: mobile-first 3D lot builder. React + react-three-fiber,
// with the compiled @tasteee/zest web components for the HUD.
export default defineConfig({
	base: process.env.VITE_BASE_PATH ?? '/',
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
		chunkSizeWarningLimit: 1600
	}
})
