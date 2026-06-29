# z-heading

A display heading. Part of the text family (see [z-text](z-text.md)); bold
weight (700) by default. The semantic tag is derived from `size`
(`xxl`→`h1`, `xl`→`h2`, `lg`→`h3`, `md`→`h4`, `sm`→`h5`, `xs`→`h6`) so visual
scale and document outline stay in sync — override with `tag` when they need to
diverge.

```html
<z-heading size="xxl">Big bold title</z-heading>
<z-heading size="md" tag="h2">Looks like h4, is an h2</z-heading>
<z-heading size="lg" color="primary">Accent heading</z-heading>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `size` | `xxl` `xl` `lg` `md` `sm` `xs` | `md` | type-scale step (also drives the default tag) |
| `tag` | any HTML tag name | derived from `size` | override the rendered element |
| `color` | `neutral` `primary` `secondary` `muted` `white` | `neutral` | text color |
| `weight` | `300` `400` `600` `700` `900` | `700` | font weight override |
| `is-italic` / `is-underlined` / `is-strikethrough` | boolean | — | decorations |
| `is-hidden` | boolean | — | hide the element |

## Slots

- _(default)_ — heading content.
