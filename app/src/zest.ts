// Registers every zest custom element and pulls in the design tokens + component
// CSS from the compiled library. Importing this once (from main.tsx) makes the
// <z-*> elements available everywhere in the blog. Rebuild the library
// (`pnpm build`) when component source changes and you want it reflected here.
import '@zest/zesty-wc.js'
import '@zest/zesty-wc.css'
