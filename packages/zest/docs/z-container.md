# z-container

A centered, max-width page/content wrapper with horizontal gutters. Centered by
default.

```html
<z-container size="lg" gutter="md">
  <!-- page content, capped to 64rem with side padding -->
</z-container>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `size` | width token / length | `xl` (80rem) | max content width — `xs` `sm` `md` `lg` `xl` `2xl` `3xl` `full` `screen`, or any length |
| `gutter` | size token / length | — | left/right padding |
| `center` | boolean | centered | declared for API completeness (centered by default) |
| `full-height` | boolean | — | `min-height: 100%` |
| `hidden` | boolean | — | hide (native attribute) |

## Slots

- _(default)_ — page content.

## Related

[z-section](z-section.md) can fold in container behaviour via its own `container`
prop, so a `<z-section>` + `<z-container>` pair can collapse into one element.
