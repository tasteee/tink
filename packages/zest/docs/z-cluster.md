# z-cluster

A horizontal, wrapping row for actions, tags, nav items, and badges. Always
flows as a row and **wraps by default** — set `wrap="false"` to keep it on one
line. `aligns-x` distributes along the row, `aligns-y` aligns the cross axis.

```html
<z-cluster gap="sm">
  <z-badge>react</z-badge>
  <z-badge>web-components</z-badge>
  <z-badge>atomico</z-badge>
</z-cluster>

<z-cluster gap="sm" aligns-x="between" wrap="false">…</z-cluster>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `gap` | size token / length | `xs` | spacing between items |
| `aligns-x` | alignment | `start` | row distribution |
| `aligns-y` | alignment | `center` | cross-axis alignment |
| `wrap` | `"false"` | wraps | pass `"false"` to disable wrapping (it's a string, not a boolean — `false` and absent would otherwise read the same) |
| `full-width` | boolean | — | `width: 100%` |
| `inset` `inset-x` `inset-y` | size token / length | — | inner padding |
| `hidden` | boolean | — | hide (native attribute) |

See [z-stack](z-stack.md) for the shared size/alignment scale.

## Slots

- _(default)_ — clustered items.
