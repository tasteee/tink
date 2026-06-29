# z-carousel

A one-per-view slider over slotted children. Each direct child is a slide; the
track translates by whole steps. Includes prev/next controls and dot indicators,
optional `loop`, and `autoplay`. Slide count is read from the slot, so markup
stays declarative.

```html
<z-carousel loop autoplay="5000">
  <img src="/1.jpg" />
  <img src="/2.jpg" />
  <img src="/3.jpg" />
</z-carousel>
```

```js
carousel.addEventListener('change', (e) => e.detail.index)
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `autoplay` | number (ms) | — | ms between auto-advances (paused on hover/focus); omit to disable |
| `loop` | boolean | — | wrap around at the ends |
| `tone` | `secondary` | neutral | accent for controls/dots |
| `is-hidden` | boolean | — | hide |

Controls and dots only appear when there's more than one slide.

## Slots

- _(default)_ — one element per slide.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `change` | `{ index }` | on every move |
