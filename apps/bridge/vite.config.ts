import { defineConfig } from "vite"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import { resolve } from "node:path"

// bridge — Svelte SPA prototype consuming the compiled @tasteee/zest
// web component library (packages/zest/dist), same pattern as apps/amore.
export default defineConfig({
	root: resolve(__dirname),
	plugins: [svelte()],
	server: {
		port: 5176,
		open: true,
		fs: { allow: [resolve(__dirname, "../..")] },
	},
	build: {
		outDir: resolve(__dirname, "dist"),
		emptyOutDir: true,
	},
})
