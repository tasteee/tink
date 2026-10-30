# z-row / z-column

One-dimensional flex lines. `z-row` runs horizontally, `z-column` stacks
vertically. Alignment is axis-based: `aligns-x` is always the horizontal
relationship and `aligns-y` the vertical one, whichever way the line flows.

```html
<z-column gap="md">
  <z-card>One</z-card>
  <z-card>Two</z-card>
</z-column>

<z-row gap="sm" aligns-y="center" aligns-x="between">
  <span>Left</span>
  <span>Right</span>
</z-row>
```

## Wrapping

`wrap` lets a row flow onto new lines: tags, filters, toolbars, action groups.

```html
<z-row wrap gap="xs" aligns-y="center">
  <z-badge>Design</z-badge>
  <z-badge>Web platform</z-badge>
  <z-badge>Tokens</z-badge>
</z-row>
```

## Stacking on small screens

`stack-below` turns a row into a column under a viewport breakpoint (`small`
40rem, `medium` 48rem, `large` 64rem, `extra-large` 80rem, the same names as
z-box's responsive columns). `aligns-x` / `aligns-y` keep their meaning on the
new axis.

```html
<z-row gap="md" stack-below="medium">
  <z-field label="First name"><z-input></z-input></z-field>
  <z-field label="Last name"><z-input></z-input></z-field>
</z-row>
```

## The size / alignment scale

`gap` (and the `inset*` props) accept a **size token**, `0` `2xs` `xs` `sm`
`md` `lg` `xl` `2xl` `3xl` `4xl`, a spacing step number (`4` → `--spacing-4`),
or any CSS length (passed through).

`aligns-x` / `aligns-y` accept `start` `center` `end` `between` `around` `evenly`
`stretch`. (On the cross axis the distribution-only values collapse to `stretch`.)

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `gap` | size token / step / length | - | spacing between children |
| `aligns-x` | alignment | - | horizontal alignment |
| `aligns-y` | alignment | - | vertical alignment |
| `wrap` | boolean | - | allow wrapping onto new lines |
| `stack-below` | `small` `medium` `large` `extra-large` | - | **z-row only**: flow as a column below this breakpoint |
| `padding` `margin` | size token / step / length | - | padding / margin on all sides |
| `inset` `inset-x` `inset-y` | size token / length | - | inner padding (padding wins if both are set) |
| `full-width` | boolean | - | `width: 100%` |
| `full-height` | boolean | - | `height: 100%` |
| `hidden` | boolean | - | hide (native attribute) |

## Slots

- _(default)_, the line's children.
