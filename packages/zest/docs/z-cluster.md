# z-cluster

A horizontal, wrapping row for actions, tags, nav items, and badges. Always
flows as a row and **wraps by default** — set the `no-wrap` attribute to keep
it on one line. `aligns-x` distributes along the row, `aligns-y` aligns the
cross axis.

```html
<z-cluster gap="sm">
	<z-badge>react</z-badge>
	<z-badge>web-components</z-badge>
	<z-badge>atomico</z-badge>
</z-cluster>

<z-cluster gap="sm" aligns-x="between" no-wrap>…</z-cluster>
```

## Attributes

| Attribute                   | Values              | Default  | Description                                                                           |
| --------------------------- | ------------------- | -------- | ------------------------------------------------------------------------------------- |
| `gap`                       | size token / length | `xs`     | spacing between items                                                                 |
| `aligns-x`                  | alignment           | `start`  | row distribution                                                                      |
| `aligns-y`                  | alignment           | `center` | cross-axis alignment                                                                  |
| `no-wrap`                   | boolean             | wraps    | presence disables wrapping (use the `no-wrap` attribute to keep children on one line) |
| `full-width`                | boolean             | —        | `width: 100%`                                                                         |
| `inset` `inset-x` `inset-y` | size token / length | —        | inner padding                                                                         |
| `hidden`                    | boolean             | —        | hide (native attribute)                                                               |

See [z-stack](z-stack.md) for the shared size/alignment scale.

## Slots

- _(default)_ — clustered items.
