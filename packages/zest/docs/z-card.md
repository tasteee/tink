# z-card

A bordered content card with rounded corners and comfortable padding. Borders
over shadows — optionally brightens its border on hover/focus.

```html
<z-card>
  <z-heading size="xs">Title</z-heading>
  <z-text color="muted">Supporting copy.</z-text>
</z-card>

<z-card is-flex is-column gap="1rem" is-reactive>
  …
</z-card>
```

## Attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `is-flex` | boolean | — | lay the card out as a flexbox |
| `is-row` / `is-column` | boolean | row | flex direction (with `is-flex`) |
| `gap` | CSS length | — | gap between flex children |
| `is-reactive` | boolean | — | brighten the border on hover / focus-within |
| `is-hidden` | boolean | — | hide the card |

## Slots

- _(default)_ — card contents.
