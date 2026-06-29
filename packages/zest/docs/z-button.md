# z-button

A button. Combine `tone` (color), `kind` (treatment), and `size`. All tones
share the same boldness so a solid button reads consistently across hues.

```html
<z-button tone="primary">Save</z-button>
<z-button tone="danger" kind="outline">Delete</z-button>
<z-button kind="ghost" size="small">Cancel</z-button>
<z-button tone="primary" is-loading>Saving…</z-button>
<z-button is-full-width>Continue</z-button>

<!-- icons go in the default slot alongside (or instead of) the label -->
<z-button>
  <svg>…</svg> With icon
</z-button>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `tone` | `neutral` `primary` `secondary` `success` `warning` `danger` | `neutral` | color family |
| `kind` | `solid` `outline` `ghost` `soft` `plain` | `solid` | visual treatment |
| `size` | `small` `medium` `large` | `medium` | size |
| `label` | string | — | text (alternative to slotting children) |
| `type` | `button` `submit` `reset` | `button` | native button type |
| `is-disabled` | boolean | — | disable |
| `is-loading` | boolean | — | show a spinner and block interaction |
| `is-full-width` | boolean | — | stretch to fill its container |
| `is-hidden` | boolean | — | hide |

## Slots

- _(default)_ — button content (label and/or icons). Ignored if `label` is set.

## Events

Use the native `click` event (`onClick` in React).

## Notes

Inside a [z-button-group](z-button-group.md) the corner radii are managed for
you, so individual buttons join into a seamless segmented control.
