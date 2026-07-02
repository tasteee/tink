# z-slider

A range control built on a native `input[type=range]` (so keyboard and a11y come
for free), fully restyled: hairline track, accent-filled progress, solid accent
thumb.

```html
<z-slider min="0" max="100" value="40"></z-slider>
<z-slider min="0" max="10" step="0.5" tone="primary" label="Volume"></z-slider>

<!-- header with a label and a live value pill -->
<z-slider label="Opacity" value="80" show-value value-suffix="%"></z-slider>
<z-slider label="Budget" value="2500" min="0" max="5000" show-value value-prefix="$"></z-slider>
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
| `label` | string | — | accessible label (`aria-label`); shown in the header when set |
| `show-value` | boolean | — | show the live value as an accent-tinted pill in the header |
| `value-prefix` | string | — | text before the displayed value (e.g. `$`) |
| `value-suffix` | string | — | text after the displayed value (e.g. `%`) |
| `tone` | `primary` `secondary` | `primary` accent | accent color |
| `is-disabled` | boolean | — | disable |
| `is-hidden` | boolean | — | hide |

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `input` | `{ value }` | while dragging |
| `change` | `{ value }` | on release |
