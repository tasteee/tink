# z-format-toolbar

A sticky formatting bar for the top of an editor, always visible (unlike the
floating `z-selection-toolbar`/`z-bubble-menu`). Includes a custom
heading-level picker — not a native `<select>`.

```html
<z-format-toolbar></z-format-toolbar>
```

```js
const toolbar = document.querySelector('z-format-toolbar')

toolbar.headingOptions = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' }
]

document.addEventListener('selectionchange', () => {
  // updated on every cursor move — the component itself coalesces these with
  // requestAnimationFrame, so you don't need to throttle on your end
  toolbar.items = [
    { value: 'bold', icon: boldIcon, isActive: isBoldActive() },
    { value: 'italic', icon: italicIcon, isActive: isItalicActive() }
  ]
  toolbar.headingValue = currentHeadingLevel()
})

toolbar.addEventListener('action', (e) => applyFormat(e.detail.value))
toolbar.addEventListener('headingchange', (e) => setHeadingLevel(e.detail.value))
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `heading-value` | string | — | the currently selected heading option's value |
| `label` | string | `Formatting` | `aria-label` for the toolbar |

## Properties

- `items` — `{ value, label?, icon?, isActive?, isDisabled? }[]` — the toggle buttons
- `headingOptions` — `{ value, label }[]` — the custom dropdown's options
- `headingPlaceholder` — label shown when no option matches `headingValue` (default `Paragraph`)

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `action` | `{ value }` | a format button was pressed |
| `headingchange` | `{ value }` | a heading option was picked |

## Interaction notes

- Button states are expected to change on every caret move; the component
  batches rapid `items` updates into a single re-render per animation frame.
- The heading dropdown is a custom `role="listbox"` panel sharing the same
  ↑/↓/Enter/Escape trap as `z-menu`, not a native `<select>`.
