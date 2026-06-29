# z-button-group

Joins a row (or column) of [z-button](z-button.md) elements into a seamless
segmented control — managing the corner radii, the 1px border overlap, and the
focus stacking so adjacent borders collapse into a single seam.

```html
<z-button-group>
  <z-button kind="outline">Day</z-button>
  <z-button kind="outline">Week</z-button>
  <z-button kind="outline">Month</z-button>
</z-button-group>

<z-button-group is-vertical>…</z-button-group>
```

## Attributes

| Attribute | Type | Description |
| --- | --- | --- |
| `is-vertical` | boolean | stack the buttons vertically (equal width) instead of in a row |

Exposes `role="group"`.

## Slots

- _(default)_ — the [z-button](z-button.md) children. Up to 8 items get explicit
  stacking order; more still work but share the base z-index.
