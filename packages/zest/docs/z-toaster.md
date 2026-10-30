# z-toaster / toaster

Transient notifications. Call the `toaster` singleton from anywhere; a `<z-toaster>` region renders the stack. One is added to `<body>` automatically if the page has none. Place your own to choose `position`.

```html
<z-toaster position="bottom-end"></z-toaster>
```

```js
import { toaster } from '@tasteee/zest'

const hide = toaster.show('Changes saved')          // a string is the title and the id
toaster.show({ id: 'upload', title: 'Uploading…', duration: Infinity })
toaster.show({ id: 'upload', title: 'Uploaded', tone: 'success' }) // same id → updates in place

hide()                     // hide the toast show() returned it for
toaster.hide('upload')     // by id, or toaster.hide({ id: 'upload' })
toaster.clear()            // hide everything
```

## Options

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `id` | `string` | generated | One toast per id. Re-showing an active id updates it and restarts its countdown. |
| `title` | `string` | | |
| `description` | `string` | | |
| `tone` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Danger toasts are announced assertively. |
| `duration` | `number` (ms) | `4000` | `Infinity` (or `0`) keeps it up until hidden. |

## Behavior

- A string toast's id is the string itself, so repeated `show('Saved')` never stacks duplicates.
- Objects without an `id` get a unique one, so identical content with different settings stacks normally.
- Timed toasts draw their remaining time as a ring around the close button.
- Countdowns pause while the stack is hovered or focused, and while the tab is hidden.
- Exits fade and shrink the toast while its row folds away, so the rest of the stack glides into place.

## Attributes

| Attribute | Values |
| --- | --- |
| `position` | `bottom-end` (default), `bottom-start`, `bottom-center`, `top-end`, `top-start`, `top-center` |
