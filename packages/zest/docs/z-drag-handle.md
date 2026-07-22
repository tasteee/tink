# z-drag-handle

A standalone grip button that initiates a block-reorder drag, plus
`z-drop-indicator`, the singleton line that follows the gap between blocks
while dragging.

```html
<z-drag-handle></z-drag-handle>
<z-drop-indicator></z-drop-indicator>
```

```js
const grip = document.querySelector('z-drag-handle')
grip.label = block.textContent.slice(0, 40) // used as the built-in ghost preview

// it's a real draggable element — native drag events bubble/compose out of
// the shadow root, listen for them directly
grip.addEventListener('dragstart', (e) => beginDrag(block, e))

const indicator = document.querySelector('z-drop-indicator')
editor.addEventListener('dragover', (e) => {
  indicator.anchorRect = computeGapRect(e)
  indicator.isOpen = true
})
grip.addEventListener('dragend', () => (indicator.isOpen = false))
```

## z-drag-handle

### Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `is-disabled` | boolean | — | disable the grip |

### Properties

- `label` — text shown in the built-in drag-ghost preview (defaults to `Block`)

### Events

Native `dragstart`/`drag`/`dragend` only — no custom event wrapper. The
grip's own `dragstart` sets a small block-preview element (built from `label`)
as the native drag image via `dataTransfer.setDragImage`, so you don't have to
build one yourself.

## z-drop-indicator

A singleton line, teleported the same way as `z-gutter-handle`.

### Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `orientation` | `horizontal` `vertical` | `horizontal` | line direction |
| `is-open` | boolean | — | show/hide |

### Properties

- `anchorRect` — the gap's rect (`{ x, y, width, height }`)

## Interaction notes

- Both elements use the shared fade+rise (120ms) / fade-only (80ms) transition
  choreography from the rest of the text-editor family.
- Pairs naturally with `z-gutter-handle`'s own grip — wire both to the same
  drag/drop logic, or use `z-drag-handle` standalone (e.g. in a reorderable
  list row outside a block editor).
