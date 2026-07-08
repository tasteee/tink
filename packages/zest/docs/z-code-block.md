# z-code-block

A monospace code surface with an optional header (language tag + filename) and a
copy-to-clipboard button. Pass the source via the `code` **property** (preserves
whitespace). Syntax highlighting is built in (lowlight / highlight.js, themed
against the zest `--syntax-*` palette) and renders synchronously in the shadow
root.

```html
<z-code-block language="ts" filename="index.ts" has-line-numbers></z-code-block>
```

```js
const block = document.querySelector('z-code-block')
block.code = `export const sum = (a, b) => a + b`
block.addEventListener('copy', () => {})
```

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `code` | string | — | the source (set as a property to preserve whitespace) |
| `language` | string | auto | highlight.js language id (also shown in the header) |
| `filename` | string | — | filename shown in the header |
| `has-line-numbers` | boolean | — | render a line-number gutter |
| `hide-copy` | boolean | — | hide the copy button |
| `tone` | `secondary` | `primary` (purple) | header language-tag accent |
| `is-hidden` | boolean | — | hide |

## Events

| Event | Description |
| --- | --- |
| `copy` | after the code is copied to the clipboard |
