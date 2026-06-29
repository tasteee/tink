# z-subheading

An uppercase, letter-spaced eyebrow / overline label. Part of the text family
(see [z-text](z-text.md)); semibold (600) and `text-transform: uppercase` by
default. Renders a `<p>` unless `tag` is set.

```html
<z-subheading size="sm" color="primary">Now in beta</z-subheading>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `size` | `xl` `lg` `md` `sm` `xs` | `md` | type-scale step |
| `tag` | any HTML tag name | `p` | element to render |
| `color` | `neutral` `primary` `secondary` `muted` `white` | `neutral` | text color |
| `weight` | `300` `400` `600` `700` `900` | `600` | font weight override |
| `is-italic` / `is-underlined` / `is-strikethrough` | boolean | — | decorations |
| `is-hidden` | boolean | — | hide the element |

## Slots

- _(default)_ — subheading content.
