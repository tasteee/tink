# z-checkbox

A square checkbox. Unchecked is a hairline outline; checked fills with the accent
and reveals a checkmark. Supports an indeterminate state. An optional slotted
label sits to the right and is fully clickable.

```html
<z-checkbox is-checked>Subscribe to updates</z-checkbox>
<z-checkbox is-indeterminate>Select all</z-checkbox>
<z-checkbox tone="primary" name="terms" value="accepted">I agree</z-checkbox>
```

```js
checkbox.addEventListener('change', (e) => e.detail.checked)
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `is-checked` | boolean | — | checked state (reflected, two-way) |
| `is-indeterminate` | boolean | — | mixed state (visual; takes precedence over checked) |
| `size` | `small` `medium` `large` | `medium` | size |
| `tone` | `primary` `secondary` | `primary` accent | accent color |
| `name` | string | — | form field name |
| `value` | string | — | form value |
| `is-disabled` | boolean | — | disable |
| `is-block` | boolean | — | render as a block element |
| `is-hidden` | boolean | — | hide |

## Slots

- _(default)_ — the label.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `change` | `{ checked, value }` | on toggle |
