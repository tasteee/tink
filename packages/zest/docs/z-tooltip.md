# z-tooltip

A hover/focus label anchored to its slotted trigger. Wrap any element. Built on
the shared overlay core (a top-layer popover), so it escapes overflow/stacking
and flips near viewport edges.

```html
<z-tooltip content="Save changes" placement="top">
  <z-button>Save</z-button>
</z-tooltip>
```

Opens after `open-delay` ms on pointerenter/focusin; closes on leave/blur or Esc.

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `content` | string | — | tooltip text (required; no content = no tooltip) |
| `placement` | `top` `bottom` `left` `right` (+ `-start`/`-end`) | `top` | preferred side |
| `offset` | number (px) | `8` | gap from the trigger |
| `open-delay` | number (ms) | `150` | delay before showing |
| `is-disabled` | boolean | — | suppress the tooltip |
| `is-hidden` | boolean | — | hide |

## Slots

- _(default)_ — the trigger element.
