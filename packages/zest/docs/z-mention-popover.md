# z-mention-popover

The "@"/"#" mention & autocomplete popover. Presentational and editor-agnostic
like `z-slash-menu` — it renders whatever `query` you feed it, and can
optionally debounce an async lookup itself.

```html
<z-mention-popover trigger="@"></z-mention-popover>
```

```js
const mention = document.querySelector('z-mention-popover')

// async source — a JS property (a function), not an attribute. The component
// debounces calls to it as `query` changes and shows a loading row meanwhile.
mention.source = (query) => fetch(`/api/users?q=${query}`).then((r) => r.json())

mention.query = currentQueryText
mention.anchorRect = caretRect
mention.isOpen = true

mention.addEventListener('select', (e) => {
  deleteMentionQueryText()
  insertMentionChip(e.detail.value, e.detail.label)
  mention.isOpen = false
})
```

Without a `source`, it filters a static `items` array locally instead:

```js
mention.items = [{ value: 'u1', label: 'Ada Lovelace' }, { value: 'u2', label: 'Alan Turing' }]
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `trigger` | string | `@` | the trigger character, shown in the a11y label |
| `placement` | `top` `bottom` `left` `right` (+ `-start`/`-end`) | `bottom-start` | preferred side |
| `offset` | number (px) | `8` | gap from `anchorRect` |
| `is-open` | boolean | — | show/hide |

## Properties

- `items` — `{ value, label?, icon?, description?, isDisabled? }[]` — static fallback list
- `source` — `(query: string) => Promise<Item[]> | Item[]` — async lookup, debounced
- `debounceMs` — debounce window for `source` calls (default `250`)
- `query` — the text typed after the trigger character
- `anchorRect` — a `DOMRect`-like object for the caret position

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `select` | `{ value, label }` | a mention was confirmed |
| `empty` | — | no matching/resolved items |
| `dismiss` | — | Escape was pressed |

## Interaction notes

- Same live-query keyboard trap as `z-slash-menu`: ↑/↓/Enter/Escape are
  intercepted, Space is never a commit key so multi-word queries keep typing
  normally.
- On `select`, delete the raw "@query" text and insert your resolved inline
  chip node — the component only hands back `{ value, label }`.
