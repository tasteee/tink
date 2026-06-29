# z-scroll

An overflow container with the design system's slim, themed scrollbars. Pick the
scrolling axis with `direction`, constrain with `max-height` / `max-width`, tune
the bar with `scrollbar`, and set overscroll behaviour with `overscroll`.

```html
<z-scroll max-height="20rem" inset="sm">
  <!-- tall content scrolls inside a styled viewport -->
</z-scroll>

<z-scroll direction="horizontal" scrollbar="thin">…</z-scroll>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `direction` | `vertical` `horizontal` `both` | `vertical` | scroll axis |
| `max-height` | CSS length | — | viewport max height |
| `max-width` | CSS length | — | viewport max width |
| `scrollbar` | `auto` `thin` `hidden` | `thin` | scrollbar treatment |
| `overscroll` | `auto` `contain` `none` | — | `overscroll-behavior` |
| `inset` `inset-x` `inset-y` | size token / length | — | inner padding of the viewport |
| `hidden` | boolean | — | hide (native attribute) |

## Slots

- _(default)_ — scrollable content.

## Related

[z-scroll-area](z-scroll-area.md) is a lighter pure-CSS variant of the same idea.
