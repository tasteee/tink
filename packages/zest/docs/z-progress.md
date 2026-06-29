# z-progress

A slim linear meter — hairline track, accent-filled bar. Determinate
(`value` of `max`) or indeterminate (`is-indeterminate`).

```html
<z-progress value="60"></z-progress>
<z-progress value="3" max="5" tone="success"></z-progress>
<z-progress is-indeterminate></z-progress>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `value` | number | `0` | current value (clamped to 0…max) |
| `max` | number | `100` | maximum |
| `tone` | `secondary` `success` `danger` | neutral | bar color |
| `size` | `small` `medium` `large` | `medium` | bar thickness |
| `is-indeterminate` | boolean | — | continuous sweep instead of a value |
| `is-hidden` | boolean | — | hide |

Exposes `role="progressbar"` with the matching `aria-value*`.

## Slots

None.
