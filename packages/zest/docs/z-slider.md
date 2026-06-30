# z-slider

A range control built on a native `input[type=range]` (so keyboard and a11y come
for free), fully restyled: hairline track, accent-filled progress, solid accent
thumb.

```html
<z-slider min="0" max="100" value="40"></z-slider>
<z-slider min="0" max="10" step="0.5" tone="primary" label="Volume"></z-slider>
```

```js
slider.addEventListener('input', (event) => event.detail.value)   // while dragging
slider.addEventListener('change', (event) => event.detail.value)  // on release
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `value` | number | `min` | current value (reflected, two-way) |
| `min` | number | `0` | minimum |
| `max` | number | `100` | maximum |
| `step` | number | `1` | step increment |
| `name` | string | — | form field name |
| `label` | string | — | accessible label (`aria-label`) |
| `tone` | `primary` `secondary` | `primary` accent | accent color |
| `is-disabled` | boolean | — | disable |
| `is-hidden` | boolean | — | hide |

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `input` | `{ value }` | while dragging |
| `change` | `{ value }` | on release |
