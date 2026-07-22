# z-status-bar

A sticky bottom bar for a text editor: word/char count, read time, cursor
position, and save state.

```html
<z-status-bar></z-status-bar>
```

```js
const bar = document.querySelector('z-status-bar')

editor.addEventListener('input', () => {
  bar.text = editor.getText() // word/char/read-time recomputed, debounced ~500ms
})

editor.addEventListener('selectionchange', () => {
  bar.cursorLine = getCursorLine()     // live, not debounced
  bar.cursorColumn = getCursorColumn()
})

save().then(() => {
  bar.saveState = 'saving'
  return persist()
}).then(() => {
  bar.saveState = 'saved' // auto-reverts to 'idle' after 2s — no timer needed
})
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `save-state` | `idle` `saving` `saved` | `idle` | current save state |

## Properties

- `text` — raw document text; word/char/read-time are recomputed from it, debounced ~500ms
- `cursorLine` / `cursorColumn` — 1-based position, updates immediately (not debounced)
- `wordsPerMinute` — reading speed used for the read-time estimate (default `200`)

## Interaction notes

- Word/char/read-time recompute is debounced because it's the expensive part
  (rescanning potentially large text); cursor position is cheap and stays
  live so it doesn't feel laggy.
- Setting `saveState = 'saved'` is a one-shot signal — the component holds it
  displayed for 2s, then reverts its own displayed state to `idle` without any
  further action from you.
