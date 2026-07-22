# z-gutter-handle

A singleton left-gutter control that teleports to whichever block the pointer
is over — a "+" (insert block) button and a drag grip. Place one instance on
the page and drive it from your block-hover tracking.

```html
<z-gutter-handle></z-gutter-handle>
```

```js
const gutter = document.querySelector('z-gutter-handle')

editor.addEventListener('blockhover', (e) => {
  gutter.anchorRect = e.detail.blockEl.getBoundingClientRect()
  gutter.isOpen = true
})

gutter.addEventListener('add', () => insertBlockAfter(hoveredBlock))

// the grip is a real draggable element — native drag events bubble/compose
// out of the shadow root as usual
gutter.addEventListener('dragstart', (e) => beginBlockDrag(hoveredBlock, e))
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `is-open` | boolean | — | show/hide |

## Properties

- `anchorRect` — the hovered block's rect (`{ x, y, width, height }`)
- `width` — handle width in px, used to offset it left of the block (default `44`)

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `add` | — | the "+" button was pressed |
| `dragstart` / `dragend` | native `DragEvent` | the grip's native drag lifecycle |

## Interaction notes

- Pair the grip's `dragstart` with `z-drag-handle`'s ghost-image technique, or
  build your own `dataTransfer.setDragImage` in your own `dragstart` listener.
- Entrance/exit uses the same fade+rise (120ms) / fade-only (80ms) choreography
  as the rest of the text-editor family.
