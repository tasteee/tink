# z-toggle

A standalone toggle button — a button with an on/off pressed state. For a set of
related toggles use [z-toggle-group](z-toggle-group.md) +
[z-toggle-group-item](z-toggle-group-item.md).

```html
<z-toggle tone="primary">
  <svg>…</svg> Bold
</z-toggle>

<z-toggle is-pressed is-icon>
  <svg>…</svg>
</z-toggle>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `tone` | `neutral` `primary` `secondary` | `neutral` | color family |
| `kind` | `outline` `ghost` | `outline` | treatment |
| `size` | `small` `medium` `large` | `medium` | size |
| `is-icon` | boolean | — | square icon-only button |
| `is-pressed` | boolean | — | the on/off state (reflected, two-way) |
| `is-disabled` | boolean | — | disable |
| `is-hidden` | boolean | — | hide |

## Slots

- _(default)_ — label and/or icon.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `press` | `{ pressed: boolean }` | fired on toggle |
