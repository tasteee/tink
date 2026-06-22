import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'ZestyWC',
			fileName: () => 'zesty-wc.js',
			formats: ['es']
		},
		rollupOptions: {
			output: {
				assetFileNames: 'zesty-wc.[ext]'
			}
		}
	}
})
