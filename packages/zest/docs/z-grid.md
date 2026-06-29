# z-grid

A CSS grid primitive. Use `columns` for a fixed count, or `min-column-width` for
a responsive auto-fit grid (the latter wins when both are set). `aligns-x` /
`aligns-y` align items within their cells.

```html
<!-- 3 equal columns -->
<z-grid columns="3" gap="md">
  <z-card>1</z-card><z-card>2</z-card><z-card>3</z-card>
</z-grid>

<!-- responsive: as many 16rem columns as fit -->
<z-grid min-column-width="16rem" gap="lg">
  …
</z-grid>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `columns` | number | — | fixed column count → `repeat(n, minmax(0, 1fr))` |
| `min-column-width` | CSS length | — | responsive auto-fit min track width (overrides `columns`) |
| `gap` | size token / length | — | row + column gap |
| `gap-x` | size token / length | — | column gap override |
| `gap-y` | size token / length | — | row gap override |
| `aligns-x` | `start` `center` `end` `stretch` | `stretch` | item justify within cell |
| `aligns-y` | `start` `center` `end` `stretch` | `stretch` | item align within cell |
| `full-width` | boolean | — | `width: 100%` |
| `inset` `inset-x` `inset-y` | size token / length | — | inner padding |
| `hidden` | boolean | — | hide (native attribute) |

See [z-stack](z-stack.md) for the shared size/alignment scale.

## Slots

- _(default)_ — grid items.
