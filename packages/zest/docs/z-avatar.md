# z-avatar

A circular identity mark. Shows an image when `src` loads, and gracefully falls
back to initials (from `name`, or given via `initials`) on a tinted ground.
Optional status dot in the corner.

```html
<z-avatar src="/me.jpg" name="Shane Colcleasure"></z-avatar>
<z-avatar name="Ada Lovelace" tone="secondary"></z-avatar>
<z-avatar initials="ZL" size="large" status="online"></z-avatar>
<z-avatar name="Box" is-square></z-avatar>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `src` | string | — | image URL (falls back to initials on error) |
| `name` | string | — | used for the alt text and initials |
| `initials` | string | derived from `name` | explicit initials (max 2 chars) |
| `size` | `xs` `small` `medium` `large` `xl` | `medium` | size |
| `tone` | `primary` `secondary` `neutral` | `primary` | initials ground tint |
| `status` | `online` `busy` `away` `offline` | — | corner status dot |
| `is-square` | boolean | — | rounded-square instead of circle |
| `is-hidden` | boolean | — | hide |

## Slots

None.
