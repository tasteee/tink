# z-radio

A single radio option — a hairline ring when off, an accent ring with a filled
dot when selected. Designed to live inside a [z-radio-group](z-radio-group.md),
which coordinates single-selection across siblings.

```html
<z-radio-group value="card">
  <z-radio value="card">Credit card</z-radio>
  <z-radio value="paypal">PayPal</z-radio>
  <z-radio value="bank" is-disabled>Bank transfer</z-radio>
</z-radio-group>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `value` | string | — | this option's value |
| `is-checked` | boolean | — | selected state (reflected; usually managed by the group) |
| `tone` | `primary` `secondary` | `primary` accent | accent color |
| `is-disabled` | boolean | — | disable |
| `is-hidden` | boolean | — | hide |

## Slots

- _(default)_ — the label.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `select` | `{ value }` | bubbles to the parent [z-radio-group](z-radio-group.md) |
