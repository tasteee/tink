# z-switch

A binary toggle rendered as a track + sliding knob. Off is a hairline outline
track; on fills with the accent and slides the knob across. An optional slotted
label sits to the right.

```html
<z-switch is-checked>Dark mode</z-switch>
<z-switch tone="primary" name="notifications">Notifications</z-switch>
```

```js
switchEl.addEventListener('change', (e) => e.detail.checked)
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `is-checked` | boolean | — | on/off state (reflected, two-way) |
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
