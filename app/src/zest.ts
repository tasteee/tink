// Registers every zest custom element and pulls in the design tokens from the
// component library (the @tasteee/zest workspace package). Importing this once
// (from main.tsx) makes the <z-*> elements available everywhere in the blog.
// In dev the library rebuilds on change (`pnpm dev` runs its watch build).
import '@tasteee/zest'
import '@tasteee/zest/ink.css'
