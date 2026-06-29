# z-section

A vertical page band. `space` is the top/bottom padding (`space-top` /
`space-bottom` override per edge). It can also fold in [z-container](z-container.md)
behaviour: set `container` to a width and the content is centered to that
max-width with `gutter` side padding.

```html
<z-section space="2xl">
  <z-heading>Features</z-heading>
</z-section>

<!-- replaces <z-section><z-container size="xl" gutter="lg"> -->
<z-section space="2xl" container="xl" gutter="lg">
  …
</z-section>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `space` | size token / length | — | top + bottom padding |
| `space-top` | size token / length | — | top padding override |
| `space-bottom` | size token / length | — | bottom padding override |
| `container` | width token / length | — | center content to this max-width (folds in z-container) |
| `gutter` | size token / length | — | side padding (with `container`) |
| `hidden` | boolean | — | hide (native attribute) |

## Slots

- _(default)_ — section content.
