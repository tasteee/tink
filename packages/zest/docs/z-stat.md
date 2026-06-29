# z-stat

A stacked statistic: a prominent value over a small muted label. Composes
[z-heading](z-heading.md) and [z-text](z-text.md) internally, so it inherits the
same type scale and colors.

```html
<z-stat value="50+" label="Components"></z-stat>
<z-stat value="99.9%" label="Uptime" size="lg" align="center"></z-stat>

<!-- richer content via slots -->
<z-stat label="Revenue">
  $1.2M <span slot="label">vs last quarter</span>
</z-stat>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `value` | string | — | the headline value |
| `label` | string | — | the caption below |
| `size` | `xxl`…`xs` | `xs` | value size (z-heading scale) |
| `label-size` | `xxl`…`xs` | `sm` | label size (z-text scale) |
| `color` | text color | — | value color |
| `label-color` | text color | `muted` | label color |
| `align` | `start` `center` `end` | `start` | cross-axis alignment |
| `is-hidden` | boolean | — | hide |

## Slots

- _(default)_ — appended after `value` (richer value content).
- `label` — appended after `label` (richer caption content).
