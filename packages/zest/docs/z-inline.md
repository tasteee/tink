# z-inline

An inline style patch, not a text variant. Unlike [z-text](z-text.md) it
carries no `size` — font-size, line-height, letter-spacing, and font-family
all inherit from whatever it's nested inside, so it can sit inside a
`z-text`/`z-heading` of any size without silently resetting to a default.
Use it to modify color, weight, or style on a fragment of text that's already
inside a sized text element.

```html
<z-text size="xl">
  A lede-sized sentence, with
  <z-inline color="muted" weight="400">a muted aside</z-inline>
  that stays the same size as its surroundings.
</z-text>
```

Renders a `<span>` by default; override with `tag`.

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `color` | `neutral` `primary` `secondary` `muted` `white` | _(inherit)_ | text color |
| `weight` | `300` `400` `600` `700` `900` | _(inherit)_ | font weight override |
| `tag` | any HTML tag name | `span` | element to render |
| `is-italic` | boolean | — | italic |
| `is-underlined` | boolean | — | underline |
| `is-strikethrough` | boolean | — | strikethrough (combine with `is-underlined` for both) |
| `is-hidden` | boolean | — | hide the element |

Unlike `z-text`, `color` defaults to inheriting rather than falling back to
`--foreground` — an unstyled `<z-inline>` is visually a no-op.

## Slots

- _(default)_ — the text content.

## Related

- [z-text](z-text.md) — sized body copy; use this when the fragment needs its own size, not just a style patch
