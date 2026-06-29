# z-hover-card

A hover-triggered preview panel (think a profile peek on a @mention). Like
[z-popover](z-popover.md) it rides the shared overlay core, but opens on
hover/focus after `open-delay` and closes after `close-delay`, with a grace
period so the pointer can travel from the trigger into the card.

```html
<z-hover-card placement="bottom">
  <z-link slot="trigger" href="/u/ada">@ada</z-link>
  <div>
    <z-avatar name="Ada Lovelace"></z-avatar>
    <z-text>Mathematician. First programmer.</z-text>
  </div>
</z-hover-card>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `placement` | `top` `bottom` `left` `right` (+ `-start`/`-end`) | `bottom` | preferred side |
| `offset` | number (px) | `8` | gap from the trigger |
| `open-delay` | number (ms) | `200` | delay before showing |
| `close-delay` | number (ms) | `150` | delay before hiding |
| `tone` | `primary` `secondary` | — | accent for the surface |
| `is-hidden` | boolean | — | hide |

The panel max width is themeable via `--z-overlay-max-width` (default `20rem`).

## Slots

- `trigger` — the element that opens the card.
- _(default)_ — the card content.
