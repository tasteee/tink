# z-table

A data table driven by `columns` and `rows` **array properties**. Uppercase
tracked header, hairline row separators, soft hover tint. Borders over fills —
no zebra striping unless `is-striped` is set.

```html
<z-table is-striped></z-table>
```

```js
const table = document.querySelector('z-table')
table.columns = [
  { key: 'name', label: 'Name' },
  { key: 'role', label: 'Role' },
  { key: 'score', label: 'Score', align: 'end', isMono: true }
]
table.rows = [
  { id: 1, name: 'Ada', role: 'Eng', score: 98 },
  { id: 2, name: 'Linus', role: 'Eng', score: 91 }
]
table.addEventListener('rowclick', (e) => e.detail) // { row, index }
```

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `columns` | `{ key, label, align?, isMono? }[]` | `[]` | **property** — column defs (`align`: `start`/`center`/`end`) |
| `rows` | `Record<string, unknown>[]` | `[]` | **property** — row objects (optional `id` for keys) |
| `empty-label` | string | `No data` | text shown when there are no rows |
| `is-striped` | boolean | — | alternate-row tint |
| `is-clickable` | boolean | — | pointer cursor + emit `rowclick` |
| `is-hidden` | boolean | — | hide |

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `rowclick` | `{ row, index }` | when a row is clicked (requires `is-clickable`) |
