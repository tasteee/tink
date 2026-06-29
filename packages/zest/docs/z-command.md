# z-command

A command palette (cmdk-style) on the native `<dialog>` foundation. Commands come
from an `items` **array property**; typing filters by label + keywords and
results stay grouped.

```html
<z-command id="cmd"></z-command>
```

```js
const cmd = document.querySelector('#cmd')
cmd.items = [
  { value: 'new', label: 'New file', group: 'File', shortcut: '⌘N' },
  { value: 'open', label: 'Open…', group: 'File', keywords: 'browse' },
  { value: 'theme', label: 'Toggle theme', group: 'View' }
]
cmd.addEventListener('select', (e) => e.detail.value)

// open it (e.g. on ⌘K)
cmd.isOpen = true
```

Keyboard: type to filter, ↑/↓ move (skipping disabled), Enter runs, Esc closes.

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `Command[]` | `[]` | **property** — `{ value?, label, group?, shortcut?, keywords?, isDisabled? }` |
| `is-open` | boolean | — | open state (reflected, two-way) |
| `placeholder` | string | `Type a command or search…` | search placeholder |
| `empty-text` | string | `No results found.` | shown when nothing matches |

## Slots

- `trigger` — optional element that opens the palette.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `select` | `{ value }` | when a command is run |
| `open` | — | when the palette opens |
| `close` | — | when the palette closes |
