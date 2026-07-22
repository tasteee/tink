# z-table-toolbar

Appears above a table whenever the cursor sits in any cell, plus
`z-table-axis-handle`, the teleporting pill that appears along a table's top
edge (columns) or left edge (rows) on axis hover.

```html
<z-table-toolbar></z-table-toolbar>
<z-table-axis-handle></z-table-axis-handle>
```

```js
const toolbar = document.querySelector('z-table-toolbar')
toolbar.items = [
  { value: 'insert-row', label: 'Insert row', icon: rowIcon },
  { value: 'merge', label: 'Merge cells', icon: mergeIcon }
]
toolbar.anchorRect = tableEl.getBoundingClientRect()
toolbar.isOpen = isCursorInsideTable()
toolbar.addEventListener('action', (e) => runTableAction(e.detail.value))

const axis = document.querySelector('z-table-axis-handle')
axis.axis = 'column'
axis.anchorRect = hoveredHeaderCell.getBoundingClientRect()
axis.isOpen = true
axis.addEventListener('select', () => selectWholeColumn(hoveredColumnIndex))
axis.addEventListener('insertafter', () => insertColumnAfter(hoveredColumnIndex))
axis.addEventListener('remove', () => deleteColumn(hoveredColumnIndex))
```

## z-table-toolbar

### Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `placement` | `top` `bottom` `left` `right` (+ `-start`/`-end`) | `top` | preferred side |
| `offset` | number (px) | `10` | gap from `anchorRect` |
| `is-open` | boolean | — | show/hide |
| `label` | string | `Table actions` | `aria-label` |

### Properties

- `items` — `{ value, label?, icon?, isDisabled? }[]`
- `anchorRect` — a `DOMRect`-like object, typically the table's own rect

### Events

| Event | `detail` | Description |
| --- | --- | --- |
| `action` | `{ value }` | a toolbar button was pressed |

## z-table-axis-handle

### Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `axis` | `row` `column` | `row` | which axis this handle represents |
| `is-open` | boolean | — | show/hide |
| `is-selected` | boolean | — | highlight the grip as the active selection |

### Properties

- `anchorRect` — the hovered row/column header rect

### Events

| Event | `detail` | Description |
| --- | --- | --- |
| `select` | — | grip clicked — select the whole row/column |
| `insertafter` | — | "+" pressed — insert a row/column after this one |
| `remove` | — | "×" pressed — delete this row/column |

## Interaction notes

- `z-table-axis-handle` is a singleton like `z-gutter-handle` — one instance
  teleports to whichever row/column is currently hovered, rather than one
  handle per row.
- `z-bubble-menu`'s `table-cell` variant covers per-cell actions (insert/delete
  relative to the current cell, merge); `z-table-axis-handle` covers whole-row
  and whole-column actions from the header edge — use both together.
