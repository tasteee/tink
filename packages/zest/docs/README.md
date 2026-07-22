# Zest component docs

Per-element usage docs for [`@tasteee/zest`](../README.md) — the framework-agnostic
`<z-*>` web component library.

## Getting started

```js
import '@tasteee/zest'          // registers every <z-*> element
import '@tasteee/zest/ink.css'  // design tokens: CSS custom properties + fonts
```

Importing `@tasteee/zest` runs `customElements.define(...)` for every element —
there's nothing else to wire up. Each component carries its own encapsulated
styles inside a shadow root and reads the document-level tokens from `ink.css`
via `var(--token)`.

### A note on attributes vs. properties

These are standard custom elements, so most options are plain HTML **attributes**.
Boolean/camelCase props map to kebab-case attributes (`isHidden` → `is-hidden`,
`openDelay` → `open-delay`).

Options that take **arrays or objects** (e.g. `options`, `items`, `columns`,
`rows`, `data`) can't be expressed as HTML attributes — set them as JS
**properties** on the element instead:

```js
const select = document.querySelector('z-select')
select.options = [{ value: 'a', label: 'Alpha' }]
```

Custom events are dispatched as bubbling, composed `CustomEvent`s. In plain DOM
listen with `el.addEventListener('change', e => e.detail)`; in React use the
`onEventName` convention where supported.

## Components

### Foundation
- [z-box](z-box.md) — flexible layout primitive
- [z-text](z-text.md) — body text, plus [z-heading](z-heading.md), [z-subheading](z-subheading.md), [z-label](z-label.md)
- [z-card](z-card.md) — bordered content card
- [z-line](z-line.md) — hairline rule
- [z-separator](z-separator.md) — labeled divider

### Layout primitives
- [z-stack](z-stack.md) — 1D flex layout
- [z-grid](z-grid.md) — CSS grid
- [z-cluster](z-cluster.md) — wrapping row
- [z-center](z-center.md) — centering box
- [z-container](z-container.md) — max-width page wrapper
- [z-section](z-section.md) — vertical page band
- [z-surface](z-surface.md) — themed panel
- [z-scroll](z-scroll.md) — themed overflow container
- [z-spacer](z-spacer.md) — flex spacing

### Buttons & actions
- [z-button](z-button.md) — button
- [z-button-group](z-button-group.md) — segmented button row
- [z-toggle](z-toggle.md) — toggle button
- [z-toggle-group](z-toggle-group.md) — toggle set
- [z-toggle-group-item](z-toggle-group-item.md) — toggle set item
- [z-link](z-link.md) — text link

### Form controls
- [z-input](z-input.md) — text field
- [z-textarea](z-textarea.md) — multi-line field
- [z-checkbox](z-checkbox.md) — checkbox
- [z-switch](z-switch.md) — switch
- [z-radio](z-radio.md) — radio option
- [z-radio-group](z-radio-group.md) — radio set
- [z-slider](z-slider.md) — range slider
- [z-select](z-select.md) — dropdown select
- [z-combobox](z-combobox.md) — searchable select
- [z-color-picker](z-color-picker.md) — color picker
- [z-input-otp](z-input-otp.md) — one-time-code input

### Data display
- [z-badge](z-badge.md) — pill / tag / chip
- [z-avatar](z-avatar.md) — identity mark
- [z-progress](z-progress.md) — progress meter
- [z-skeleton](z-skeleton.md) — loading placeholder
- [z-table](z-table.md) — data table
- [z-pagination](z-pagination.md) — page navigation
- [z-stat](z-stat.md) — statistic block

### Navigation & disclosure
- [z-breadcrumbs](z-breadcrumbs.md) — breadcrumb trail
- [z-tabs](z-tabs.md) — tabs
- [z-collapsible](z-collapsible.md) — disclosure section
- [z-accordion](z-accordion.md) — accordion
- [z-menu](z-menu.md) — dropdown menu
- [z-nav-menu](z-nav-menu.md) — navigation bar
- [z-sidebar](z-sidebar.md) — sidebar nav rail

### Overlays
- [z-tooltip](z-tooltip.md) — tooltip
- [z-popover](z-popover.md) — popover
- [z-hover-card](z-hover-card.md) — hover card
- [z-dialog](z-dialog.md) — modal dialog
- [z-alert-dialog](z-alert-dialog.md) — confirmation dialog
- [z-alert](z-alert.md) — inline alert banner
- [z-sheet](z-sheet.md) — edge sheet
- [z-drawer](z-drawer.md) — bottom drawer
- [z-context-menu](z-context-menu.md) — right-click menu
- [z-toast](z-toast.md) — toast notifications
- [z-command](z-command.md) — command palette

### Specialized
- [z-empty-state](z-empty-state.md) — empty placeholder
- [z-scroll-area](z-scroll-area.md) — styled scroll area
- [z-code-block](z-code-block.md) — code block
- [z-post-meta](z-post-meta.md) — blog byline
- [z-carousel](z-carousel.md) — carousel
- [z-chart](z-chart.md) — minimal chart

### Text editor
Presentational, editor-agnostic UI for building a rich-text editor — no
ProseMirror/Slate/Lexical dependency, no assumed document model. Floating
elements are singletons (place one instance, drive it via `anchorRect`/
`isOpen`, same shape as `z-toast`); positioning and the shared open/close
choreography (fade + 4px rise over 120ms in, fade-only over 80ms out) come
from `shared/overlay.ts` and `shared/transition.ts`. Stacking uses the
`--z-toolbar` / `--z-menu` / `--z-overlay` tokens.
- [z-selection-toolbar](z-selection-toolbar.md) — floating formatting strip over a selection
- [z-gutter-handle](z-gutter-handle.md) — teleporting block-hover gutter control
- [z-slash-menu](z-slash-menu.md) — "/" command menu
- [z-mention-popover](z-mention-popover.md) — "@"/"#" mention & autocomplete popover
- [z-format-toolbar](z-format-toolbar.md) — sticky formatting bar with a custom heading picker
- [z-bubble-menu](z-bubble-menu.md) — link / image / table-cell contextual menu
- [z-drag-handle](z-drag-handle.md) — block-reorder grip + drop indicator
- [z-table-toolbar](z-table-toolbar.md) — table toolbar + row/column axis handle
- [z-comment-thread](z-comment-thread.md) — inline comment mark, gutter icon, and thread panel
- [z-status-bar](z-status-bar.md) — word/char count, read time, cursor position, save state
