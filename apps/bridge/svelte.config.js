import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"

// Treat every z element tag as a custom element, not a Svelte component.
export default {
	preprocess: vitePreprocess(),
	compilerOptions: {
		customElement: false,
	},
}
