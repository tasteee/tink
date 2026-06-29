# z-center

Centers its content on both axes by default. Override either axis with
`aligns-x` / `aligns-y`, force dead center with `both`, constrain the inner
content with `max-width`, center text with `text`, and use `min-height` for
full-viewport hero centering.

```html
<z-center min-height="100dvh">
  <z-heading size="xl">Centered hero</z-heading>
</z-center>

<z-center max-width="md" text>
  <z-text>Centered, width-capped prose.</z-text>
</z-center>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `aligns-x` | `start` `center` `end` | `center` | horizontal alignment |
| `aligns-y` | `start` `center` `end` | `center` | vertical alignment |
| `both` | boolean | — | force dead center on both axes |
| `max-width` | width token / length | — | cap the inner content block (`xs`…`3xl`, `full`, `screen`, or any length) |
| `text` | boolean | — | `text-align: center` |
| `min-height` | CSS length | — | minimum height (e.g. `100dvh`) |
| `full-width` / `full-height` | boolean | — | stretch to fill |
| `inset` `inset-x` `inset-y` | size token / length | — | inner padding |
| `hidden` | boolean | — | hide (native attribute) |

## Slots

- _(default)_ — content to center.
