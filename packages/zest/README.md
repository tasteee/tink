# @tasteee/zest

A gorgeous, fully featured, framework-agnostic web component library with a dark and a light theme. Use it in plain HTML, React, Vue, Svelte, or anywhere else.

The components are built with [Atomico](https://atomicojs.dev) and ship as a
self-contained bundle. Atomico and the syntax highlighter are bundled in at
build time. `atomico` is still listed as a dependency, but only because the
public type declarations reference its types.

## Install

```sh
npm install @tasteee/zest
# or: pnpm add @tasteee/zest
```

## Usage

```js
import '@tasteee/zest'          // registers every z element
import '@tasteee/zest/ink.css'  // design tokens: CSS custom properties
```

- **`@tasteee/zest`** runs the side-effectful registration. Importing it calls
  `customElements.define(...)` for all elements. There's nothing else to wire
  up. Each component carries its own encapsulated styles inside its shadow DOM.

- **`@tasteee/zest/ink.css`** defines the document-level design tokens (colors,
  spacing, typography custom properties) that the components read via
  `var(--token)`. Fonts are opt-in: add `import '@tasteee/zest/fonts.css'` for DM Sans / DM Mono.

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
attribute autocompletion for the z elements.

## Documentation

The docs site is the single source of truth: <https://tasteee.github.io/tink/docs>.
Every element has a page with live examples, its full API, and its keyboard map.

## Components

### Complete catalog

The generated [`custom-elements.json`](./custom-elements.json) is the
machine-readable source for editor tooling; the docs component manifest mirrors
the same 97 elements.

#### Foundations

`z-box` `z-display` `z-eyebrow` `z-text` `z-heading` `z-subheading` `z-label` `z-inline` `z-card` `z-line` `z-separator`

#### Layout

`z-row` `z-column` `z-grid` `z-bento-grid` `z-bento-item` `z-center` `z-container` `z-section` `z-surface` `z-scroll` `z-spacer` `z-chassis` 

#### Actions

`z-button` `z-button-group` `z-toggle-button` `z-toggle-button-group` `z-toggle-button-group-item` `z-toolbar` `z-toolbar-group` `z-swap` `z-link`

#### Forms

`z-field` `z-input` `z-number-input` `z-textarea` `z-checkbox` `z-switch` `z-radio` `z-radio-group` `z-slider` `z-range` `z-select` `z-combobox` `z-filter` `z-color-picker` `z-input-otp`

#### Data Display

`z-badge` `z-avatar` `z-avatar-stack` `z-progress` `z-skeleton` `z-table` `z-pagination` `z-stat` `z-relative-time` `z-status-dot` `z-kbd` `z-list` `z-list-row` `z-tree` 

#### Navigation

`z-breadcrumbs` `z-tabs` `z-collapsible` `z-accordion` `z-menu` `z-nav-menu` `z-sidebar` `z-dock` `z-dock-item`

#### Overlays

`z-tooltip` `z-popover` `z-hover-card` `z-dialog` `z-alert-dialog` `z-alert` `z-sheet` `z-drawer` `z-context-menu` `z-toaster` `z-command`

#### Specialized

`z-callout` `z-empty-state` `z-scroll-area` `z-code-block` `z-carousel` `z-marquee` `z-pointer-follow` `z-draggable` `z-drop-target` `z-sortable` `z-dropzone`

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
