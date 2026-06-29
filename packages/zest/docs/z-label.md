# z-label

A UI label. Part of the text family (see [z-text](z-text.md)); medium weight
(500), renders an inline `<span>` by default.

```html
<z-label>Email address</z-label>
<z-label size="sm" color="muted">Optional</z-label>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `size` | `lg` `md` `sm` `xs` | `md` | type-scale step |
| `tag` | any HTML tag name | `span` | element to render |
| `color` | `neutral` `primary` `secondary` `muted` `white` | `neutral` | text color |
| `weight` | `300` `400` `600` `700` `900` | `500` | font weight override |
| `is-italic` / `is-underlined` / `is-strikethrough` | boolean | — | decorations |
| `is-hidden` | boolean | — | hide the element |

## Slots

- _(default)_ — label content.
