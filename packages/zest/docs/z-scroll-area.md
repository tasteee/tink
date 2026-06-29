# z-scroll-area

A scroll container with the design system's slim, themed scrollbars instead of
the chunky native ones. Constrain it with `max-height` (or `height`) and let the
default slot overflow. Pure CSS — the styled scrollbar lives inside the shadow
root so it never leaks to the page.

```html
<z-scroll-area max-height="20rem">
  <!-- long content -->
</z-scroll-area>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `max-height` | CSS length | — | viewport max height |
| `height` | CSS length | — | fixed viewport height |
| `orientation` | `vertical` `horizontal` | both | which axis scrolls |
| `is-hidden` | boolean | — | hide |

## Slots

- _(default)_ — scrollable content.

## Related

[z-scroll](z-scroll.md) is the fuller-featured variant (axis modes, overscroll,
inset padding, scrollbar visibility).
