# z-text

Body / paragraph text. Part of the text family defined together with
[z-heading](z-heading.md), [z-subheading](z-subheading.md), and
[z-label](z-label.md) — they share the same props and type scale, differing only
in default weight, transform, and element tag.

```html
<z-text>Default paragraph text.</z-text>
<z-text size="lg" color="muted">Larger muted lead-in.</z-text>
<z-text size="sm" weight="600" is-italic>Small, semibold, italic.</z-text>
```

Renders a `<p>` by default; override with `tag`.

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `size` | `xxl` `xl` `lg` `md` `sm` `xs` | `md` | type-scale step |
| `color` | `neutral` `primary` `secondary` `muted` `white` | `neutral` | text color |
| `weight` | `300` `400` `600` `700` `900` | variant default | font weight override |
| `tag` | any HTML tag name | `p` | element to render |
| `is-italic` | boolean | — | italic |
| `is-underlined` | boolean | — | underline |
| `is-strikethrough` | boolean | — | strikethrough (combine with `is-underlined` for both) |
| `is-hidden` | boolean | — | hide the element |

## Slots

- _(default)_ — the text content.

## Related

- [z-heading](z-heading.md) — bold display headings (`<h1>`–`<h6>`)
- [z-subheading](z-subheading.md) — uppercase tracked eyebrow text
- [z-label](z-label.md) — UI labels (`<span>`)
