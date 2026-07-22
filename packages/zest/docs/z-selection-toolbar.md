# z-selection-toolbar

A floating formatting strip that appears above a text selection. It's a
singleton — place one instance on the page (same shape as `z-toast`) and drive
it imperatively from your `selectionchange` handling. Its own `mousedown` is
prevented by default so clicking a button never collapses the live selection
first.

```html
<z-selection-toolbar></z-selection-toolbar>
```

```js
const bar = document.querySelector('z-selection-toolbar')

document.addEventListener('selectionchange', () => {
  const selection = document.getSelection()
  const isCollapsed = !selection || selection.isCollapsed
  bar.isOpen = !isCollapsed
  if (isCollapsed) return

  const range = selection.getRangeAt(0)
  bar.anchorRect = range.getBoundingClientRect()
  bar.items = [
    { value: 'bold', label: 'Bold', icon: boldIcon, isActive: isBoldActive() },
    { value: 'italic', label: 'Italic', icon: italicIcon, isActive: isItalicActive() }
  ]
})

bar.addEventListener('action', (e) => applyFormat(e.detail.value))
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `placement` | `top` `bottom` `left` `right` (+ `-start`/`-end`) | `top` | preferred side relative to `anchorRect` |
| `offset` | number (px) | `10` | gap from the selection rect |
| `is-open` | boolean | — | show/hide |
| `label` | string | `Selection formatting` | `aria-label` for the toolbar |

## Properties

- `items` — `{ value, label?, icon?, isActive?, isDisabled? }[]`
- `anchorRect` — a `DOMRect`-like object (e.g. `Range.getBoundingClientRect()`)

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `action` | `{ value }` | a toolbar button was pressed |

## Interaction notes

- Entrance/exit follow the shared editor-overlay choreography: fade + 4px rise
  over 120ms on open, fade only over 80ms on close.
- Positioned via `shared/overlay.ts`'s `computePosition`/`autoUpdate`, so it
  flips side and stays clamped to the viewport automatically.
