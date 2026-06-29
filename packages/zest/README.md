# @tasteee/zest

A gorgeous, dark theme, fully-featured, framework-agnostic web component library.Use it in in plain HTML, React, Vue, Svelte, or anywhere else.

The components are built with [Atomico](https://atomicojs.dev) and ship as a
single self-contained bundle with **zero runtime dependencies** (Atomico and the
syntax-highlighting deps are bundled in at build time).

## Install

```sh
npm install @tasteee/zest
# or: pnpm add @tasteee/zest
```

## Usage

```js
import '@tasteee/zest'          // registers every <z-*> element
import '@tasteee/zest/ink.css'  // design tokens: CSS custom properties + fonts
```

- **`@tasteee/zest`** runs the side-effectful registration. Importing it calls
  `customElements.define(...)` for all elements. There's nothing else to wire
  up. Each component carries its own encapsulated styles inside its shadow DOM.

- **`@tasteee/zest/ink.css`** defines the document-level design tokens (colors,
  spacing, typography custom properties) that the components read via
  `var(--token)`. It also loads the DM Sans / DM Mono fonts from Google Fonts.

TODO: Make it so fonts can be opted into, rather than automatic.

### React

```jsx
import '@tasteee/zest'
import '@tasteee/zest/ink.css'

export function App() {
  return (
    <z-button kind="primary" onClick={() => console.log('clicked')}>
      Click me
    </z-button>
  )
}
```

### Plain HTML

(script must be `type="module"` since the bundle is ESM)

```html
<link rel="stylesheet" href="/node_modules/@tasteee/zest/dist/ink.css" />
<script type="module" src="/node_modules/@tasteee/zest/dist/zest.js"></script>
<z-button kind="primary">Click me</z-button>
```

### From a CDN (no build step)

A CDN resolves the package name for you, so here you can use it directly:

```html
<link rel="stylesheet" href="https://esm.sh/@tasteee/zest/ink.css" />
<script type="module" src="https://esm.sh/@tasteee/zest"></script>

<z-button kind="primary">Click me</z-button>
```

## TypeScript & editor support

The package ships type declarations (`dist/index.d.ts`) and a
[Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest)
at `custom-elements.json` (referenced via the `customElements` field in
`package.json`). Editors and tools that read the manifest get tag-name and
attribute autocompletion for the `<z-*>` elements.

## Components

Foundation `z-box` `z-text` `z-card` `z-line` `z-separator` ·
Layout `z-stack` `z-grid` `z-cluster` `z-center` `z-container` `z-section`
`z-surface` `z-scroll` `z-spacer` ·
Actions `z-button` `z-button-group` `z-toggle` `z-toggle-group` `z-link` ·
Forms `z-input` `z-textarea` `z-checkbox` `z-switch` `z-radio` `z-radio-group`
`z-slider` `z-select` `z-combobox` `z-color-picker` `z-input-otp` ·
Data display `z-badge` `z-avatar` `z-progress` `z-skeleton` `z-table`
`z-pagination` `z-stat` ·
Navigation `z-breadcrumbs` `z-tabs` `z-collapsible` `z-accordion` `z-menu`
`z-nav-menu` `z-sidebar` ·
Overlays `z-tooltip` `z-popover` `z-hover-card` `z-dialog` `z-alert-dialog`
`z-alert` `z-sheet` `z-drawer` `z-context-menu` `z-toast` `z-command` ·
Specialized `z-empty-state` `z-scroll-area` `z-code-block` `z-post-meta`
`z-carousel` `z-chart`

## Local development

```sh
pnpm install
pnpm dev      # rebuilds dist/ on change (vite build --watch)
pnpm build    # dist/zest.js + dist/ink.css + dist/*.d.ts + custom-elements.json
```

## Publishing

```sh
pnpm build
npm publish
# prepublishOnly runs the build
# publishConfig.access is "public"
```

## License

MIT
