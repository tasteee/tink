# z-popover

A click-triggered floating panel for rich content. The trigger goes in
`[slot="trigger"]`; the panel body is the default slot. Rides the shared overlay
core (top-layer, auto-flipping). Dismisses on outside-click + Esc.

```html
<z-popover placement="bottom-start">
  <z-button slot="trigger">Open</z-button>
  <div>
    <z-heading size="xs">Panel</z-heading>
    <z-text color="muted">Any content goes here.</z-text>
  </div>
</z-popover>
```

```js
popover.addEventListener('toggle', (e) => e.detail.open)
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `placement` | `top` `bottom` `left` `right` (+ `-start`/`-end`) | `bottom` | preferred side |
| `offset` | number (px) | `8` | gap from the trigger |
| `tone` | `primary` `secondary` | — | accent for the surface |
| `is-disabled` | boolean | — | prevent opening |
| `is-hidden` | boolean | — | hide |

The panel max width is themeable via `--z-overlay-max-width` (default `22rem`).

## Slots

- `trigger` — the element that opens the popover.
- _(default)_ — the panel content.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `toggle` | `{ open }` | when opened or closed |
