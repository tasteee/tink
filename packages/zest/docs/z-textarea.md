# z-textarea

A multi-line text field with the same hairline-to-accent focus treatment as
[z-input](z-input.md). Supports auto-grow so the field tracks content height
without a scrollbar.

For standalone usage, wrap this control in [`z-field`](z-field.md) to provide
its visible and accessible label. Use `label` directly only for compact controls
with clear surrounding context.

```html
<z-textarea placeholder="Write a comment…" rows="4"></z-textarea>
<z-textarea is-auto-resize></z-textarea>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `value` | string | — | current value (reflected, two-way) |
| `placeholder` | string | — | placeholder text |
| `name` | string | — | form field name |
| `rows` | number | `3` | initial visible rows |
| `tone` | `primary` `secondary` | `primary` accent | focus accent color |
| `is-auto-resize` | boolean | — | grow to fit content (disables manual resize) |
| `is-invalid` | boolean | — | error styling |
| `is-disabled` | boolean | — | disable |
| `is-readonly` | boolean | — | read-only |
| `is-required` | boolean | — | required |
| `is-hidden` | boolean | — | hide |

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `input` | `{ value }` | on every keystroke |
| `change` | `{ value }` | on blur |
