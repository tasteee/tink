# z-box

A flexible layout primitive — the lowest-level building block. It exposes flex
and grid display modes, alignment, gap, margin, padding, and sizing as
attributes, resolving each against the design-system spacing scale.

```html
<z-box is-flex is-row gap="3" x-between y-center padding="4">
  <span>Left</span>
  <span>Right</span>
</z-box>
```

## Value scale

Spacing-style props (`gap`, `margin*`, `padding*`) accept either:
- a **scale step** `0`–`8` → maps to `--space-*` tokens (`3` = `--space-md`, `4` = `--space-base`, …; values above 8 fall back to `calc(var(--space-base) * n)`).
- any **CSS length** (`1rem`, `12px`, `2ch`), passed through verbatim.

Sizing props (`width`, `height`, …) treat a bare number as `px` and pass any
other CSS length through. Grid `columns`/`rows` treat a bare number as
`repeat(n, minmax(0, 1fr))`.

## Display attributes (boolean)

| Attribute | Effect |
| --- | --- |
| `is-row` / `is-column` | `flex-direction` |
| `is-flex` / `is-inline-flex` | `display: flex` / `inline-flex` |
| `is-grid` / `is-inline-grid` | `display: grid` / `inline-grid` |
| `is-block` / `is-inline-block` / `is-inline` | block display modes |
| `does-wrap` | `flex-wrap: wrap` |
| `does-wrap-text` | allow text wrapping |

## Alignment attributes (boolean)

Main axis (`x-*`): `x-start` `x-center` `x-end` `x-between` `x-around` `x-evenly` `x-stretch`
Cross axis (`y-*`): `y-start` `y-center` `y-end` `y-between` `y-around` `y-evenly` `y-stretch`

## Value attributes

| Attribute | Description |
| --- | --- |
| `gap` `row-gap` `column-gap` | spacing between children |
| `margin` `margin-x` `margin-y` `margin-top/right/bottom/left` | outer spacing |
| `padding` `padding-x` `padding-y` `padding-top/right/bottom/left` | inner spacing |
| `width` `min-width` `max-width` `height` `min-height` `max-height` | sizing |
| `columns` `rows` | grid template (number → `repeat(n, …)`) |
| `small-columns` `medium-columns` `large-columns` `extra-large-columns` | responsive grid columns |

## Slots

- _(default)_ — box contents.

## Notes

`z-box` is the general escape hatch; for common patterns prefer the dedicated
primitives ([z-stack](z-stack.md), [z-grid](z-grid.md), [z-cluster](z-cluster.md),
[z-center](z-center.md)) which expose a cleaner axis-based API.
