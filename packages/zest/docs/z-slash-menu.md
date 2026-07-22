# z-slash-menu

The "/" command menu. This is presentational and editor-agnostic — it doesn't
watch your contenteditable for "/" or own the raw "/query" text; that stays in
your document as real text until a command is confirmed or the menu bails.

```html
<z-slash-menu></z-slash-menu>
```

```js
const menu = document.querySelector('z-slash-menu')

menu.items = [
  { value: 'h1', label: 'Heading 1', icon: h1Icon, description: 'Big section heading' },
  { value: 'todo', label: 'To-do list', icon: todoIcon }
]

// on every keystroke after "/", update query + caret rect
menu.query = currentQueryText
menu.anchorRect = caretRect
menu.isOpen = true

menu.addEventListener('select', (e) => {
  deleteSlashQueryText()
  insertBlock(e.detail.value)
  menu.isOpen = false
})

menu.addEventListener('dismiss', () => (menu.isOpen = false))
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `placement` | `top` `bottom` `left` `right` (+ `-start`/`-end`) | `bottom-start` | preferred side |
| `offset` | number (px) | `8` | gap from `anchorRect` |
| `is-open` | boolean | — | show/hide |

## Properties

- `items` — `{ value, label?, icon?, description?, isDisabled? }[]`
- `query` — the text typed after "/"; filters `items` live (case-insensitive, matches label + description)
- `anchorRect` — a `DOMRect`-like object for the caret position

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `select` | `{ value }` | a command was confirmed |
| `empty` | — | the live `query` has no matching items |
| `dismiss` | — | Escape was pressed |

## Interaction notes

- **Keyboard trap**: ↑/↓ move (skipping disabled rows), Enter confirms, Escape
  dismisses — all via `document`-level capture so they work no matter where
  focus sits in your contenteditable.
- **Space is never swallowed.** It's an ordinary character your document keeps
  typing. The canonical "bail on space with no match" behavior: listen for
  `empty` to know the live query has zero matches, then on your own space
  keydown handling, close the menu (`isOpen = false`) and leave "/query " as
  plain text — delete nothing.
- On `select`, delete the "/query" text yourself and insert whatever the
  chosen item represents.
