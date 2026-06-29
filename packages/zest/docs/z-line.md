# z-line

A bare 1px hairline divider — the minimal primitive used inside dense layouts.
For a divider with a centered label, use [z-separator](z-separator.md) instead.

```html
<z-line></z-line>

<!-- inside a horizontal row -->
<z-box is-flex is-row gap="2">
  <span>A</span>
  <z-line is-vertical></z-line>
  <span>B</span>
</z-box>
```

## Attributes

| Attribute | Type | Description |
| --- | --- | --- |
| `is-vertical` | boolean | render a vertical 1px rule (full height) instead of horizontal |
| `is-horizontal` | boolean | explicit horizontal (the default) |

Exposes `role="separator"` with the matching `aria-orientation`.

## Slots

None.
