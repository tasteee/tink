# z-spacer

Empty spacing inside a flex layout. Give it a fixed `size` (applied to both axes,
so it works in a row or a column), or set `grow` to soak up the remaining space —
handy for pushing trailing items to the end of a toolbar.

```html
<z-stack is-row>
  <span>Brand</span>
  <z-spacer grow></z-spacer>
  <z-button>Sign in</z-button>
</z-stack>

<z-spacer size="lg"></z-spacer>
```

## Attributes

| Attribute | Values | Description |
| --- | --- | --- |
| `size` | size token / length | fixed size on both axes |
| `grow` | boolean | flex-grow to fill remaining space |

See [z-stack](z-stack.md) for the size token scale.

## Slots

None.
