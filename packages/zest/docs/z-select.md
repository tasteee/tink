# z-select

A custom dropdown select. The trigger shows the selected label (or a
placeholder); the panel is a bordered, shadow-free popover. Options are supplied
as an `options` **array property** (not an attribute).

For standalone usage, wrap this control in [`z-field`](z-field.md) to provide
its visible and accessible label. Use `label` directly only for compact controls
with clear surrounding context.

```html
<z-select placeholder="Pick a fruit"></z-select>
```

```js
const select = document.querySelector('z-select')
select.options = [
  { value: 'apple', label: 'Apple' },
  { value: 'pear', label: 'Pear' },
  { value: 'fig', label: 'Fig', isDisabled: true }
]
select.addEventListener('change', (e) => e.detail.value)
```

Keyboard: ↑/↓ move, Enter/Space picks, Esc closes; clicking outside closes.

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `{ value, label, isDisabled? }[]` | `[]` | **property** — the option list |
| `value` | string | — | selected value (reflected attribute, two-way) |
| `placeholder` | string | `Select…` | empty-state text |
| `size` | `small` `medium` `large` | `medium` | size |
| `tone` | `primary` `secondary` | `primary` accent | accent color |
| `is-invalid` | boolean | — | error styling |
| `is-disabled` | boolean | — | disable |
| `is-inline` | boolean | — | shrink to content width |
| `is-hidden` | boolean | — | hide |

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `change` | `{ value }` | on selection |

## Related

[z-combobox](z-combobox.md) is the type-to-filter version of this.
