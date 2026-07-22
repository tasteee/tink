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

### Complete catalog

The generated [`custom-elements.json`](./custom-elements.json) is the
machine-readable source for editor tooling; the docs component manifest mirrors
the same 153 elements.

#### Foundations

`z-box` `z-display` `z-eyebrow` `z-text` `z-heading` `z-subheading` `z-label` `z-inline` `z-card` `z-line` `z-separator`

#### Layout

`z-row` `z-column` `z-stack` `z-grid` `z-bento-grid` `z-bento-item` `z-cluster` `z-center` `z-container` `z-section` `z-surface` `z-scroll` `z-spacer` `z-chassis` `z-resizable-panels` `z-panel` `z-panel-handle` `z-editor-canvas` `z-canvas-item`

#### Actions

`z-button` `z-button-group` `z-toggle` `z-toggle-group` `z-toggle-group-item` `z-toolbar` `z-toolbar-group` `z-swap` `z-link`

#### Forms

`z-field` `z-input` `z-number-input` `z-textarea` `z-checkbox` `z-switch` `z-radio` `z-radio-group` `z-slider` `z-range` `z-range-handle` `z-select` `z-combobox` `z-filter` `z-color-picker` `z-input-otp`

#### Data Display

`z-badge` `z-avatar` `z-avatar-stack` `z-progress` `z-skeleton` `z-table` `z-pagination` `z-stat` `z-relative-time` `z-status-dot` `z-kbd` `z-list` `z-list-row` `z-tree` `z-virtual-list`

#### Navigation

`z-breadcrumbs` `z-tabs` `z-collapsible` `z-accordion` `z-menu` `z-nav-menu` `z-sidebar` `z-dock` `z-dock-item`

#### Overlays

`z-tooltip` `z-popover` `z-hover-card` `z-dialog` `z-alert-dialog` `z-alert` `z-sheet` `z-drawer` `z-context-menu` `z-toast` `z-command`

#### Specialized

`z-callout` `z-empty-state` `z-scroll-area` `z-code-block` `z-markdown` `z-terminal` `z-post-meta` `z-carousel` `z-chart` `z-aura` `z-marquee` `z-progressive-blur` `z-pointer-follow` `z-draggable` `z-drop-target` `z-sortable` `z-dropzone` `z-piano-roll` `z-pattern-roll`

#### Chat

`z-chat-shell` `z-chat-header` `z-conversation-list` `z-conversation-item` `z-message-list` `z-message-group` `z-message-bubble` `z-message-actions` `z-reactions` `z-emoji-picker` `z-date-divider` `z-unread-divider` `z-system-message` `z-delivery-status` `z-read-receipt` `z-quoted-message` `z-file-attachment` `z-image-message` `z-attachment-chip` `z-attachment-tray` `z-typing-indicator` `z-composer` `z-send-button` `z-streaming-text` `z-thinking` `z-tool-call` `z-citation` `z-sources` `z-suggestion-chips` `z-model-picker`

#### Text editor

Presentational, editor-agnostic building blocks for a rich-text editor UI — see
[docs/README.md](./docs/README.md#text-editor) for the full section.

`z-selection-toolbar` `z-gutter-handle` `z-slash-menu` `z-mention-popover` `z-format-toolbar` `z-bubble-menu` `z-drag-handle` `z-drop-indicator` `z-table-toolbar` `z-table-axis-handle` `z-comment-mark` `z-comment-gutter-icon` `z-comment-thread-panel` `z-status-bar`

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
