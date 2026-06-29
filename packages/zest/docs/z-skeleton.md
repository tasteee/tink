# z-skeleton

A loading placeholder — a faint surface with a slow shimmer. Shapes: `text`
(default), `circle`, `rect`. `width`/`height` accept any CSS length; `lines`
repeats the text shape (the last line is shortened).

```html
<z-skeleton></z-skeleton>
<z-skeleton shape="circle" width="3rem"></z-skeleton>
<z-skeleton shape="rect" width="100%" height="12rem"></z-skeleton>
<z-skeleton lines="3"></z-skeleton>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `shape` | `text` `circle` `rect` | `text` | placeholder shape |
| `width` | CSS length | — | width (circles become square if only width is given) |
| `height` | CSS length | — | height |
| `lines` | number | `1` | repeat the text shape N times |
| `is-inline` | boolean | — | `display: inline-block` |
| `is-hidden` | boolean | — | hide |

Exposes `aria-busy="true"`. The shimmer is disabled under
`prefers-reduced-motion`.

## Slots

None.
