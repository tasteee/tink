# z-combobox

A select you can type into — the trigger is a text input that filters the option
list as you type. Same bordered, shadow-free popover as [z-select](z-select.md).
Options come from an `options` **array property**.

```html
<z-combobox placeholder="Search frameworks…"></z-combobox>
```

```js
const combo = document.querySelector('z-combobox')
combo.options = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' }
]
combo.addEventListener('change', (e) => e.detail.value)
```

Keyboard: type to filter, ↑/↓ move, Enter commits the active row, Esc closes.

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `{ value, label, isDisabled? }[]` | `[]` | **property** — the option list |
| `value` | string | — | selected value (reflected attribute, two-way) |
| `placeholder` | string | `Search…` | input placeholder |
| `tone` | `primary` `secondary` | `primary` accent | accent color |
| `is-disabled` | boolean | — | disable |
| `is-inline` | boolean | — | shrink to content width |
| `is-hidden` | boolean | — | hide |

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `change` | `{ value }` | on selection |
