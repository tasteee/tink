# z-stack

A one-dimensional flex layout. The axis is a column by default; add `is-row` for
a horizontal row (`is-column` is the explicit default). Alignment is axis-based:
`aligns-x` is always the horizontal relationship and `aligns-y` the vertical one,
regardless of direction.

```html
<z-stack gap="md">
  <z-card>One</z-card>
  <z-card>Two</z-card>
</z-stack>

<z-stack is-row gap="sm" aligns-y="center" aligns-x="between">
  <span>Left</span>
  <span>Right</span>
</z-stack>
```

## The size / alignment scale

`gap` (and the `inset*` props) accept a **size token** — `0` `2xs` `xs` `sm`
`md` `lg` `xl` `2xl` `3xl` `4xl` — or any CSS length (passed through).

`aligns-x` / `aligns-y` accept `start` `center` `end` `between` `around` `evenly`
`stretch`. (On the cross axis the distribution-only values collapse to `stretch`.)

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `is-row` | boolean | — | flow as a horizontal row |
| `is-column` | boolean | column | flow as a column (the default; declared for symmetry) |
| `gap` | size token / length | — | spacing between children |
| `aligns-x` | alignment | — | horizontal alignment |
| `aligns-y` | alignment | — | vertical alignment |
| `wrap` | boolean | — | allow wrapping |
| `full-width` | boolean | — | `width: 100%` |
| `full-height` | boolean | — | `height: 100%` |
| `inset` `inset-x` `inset-y` | size token / length | — | inner padding |
| `hidden` | boolean | — | hide (native attribute) |

## Slots

- _(default)_ — stacked children.
