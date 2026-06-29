# z-badge

A compact pill for status, metadata, and tags. Three kinds (soft tint, solid
fill, outline) across the full tone set, in two sizes, plus an `is-dot`
inline-status mode. Static by default — opt into interactivity to make it a
selectable chip or a removable tag (this absorbs what used to be `z-chip`).

```html
<z-badge tone="success">Active</z-badge>
<z-badge tone="primary" kind="solid">New</z-badge>
<z-badge is-dot tone="success">Online</z-badge>

<!-- selectable chip -->
<z-badge is-selectable value="react">React</z-badge>
<!-- removable tag -->
<z-badge is-removable value="draft">Draft</z-badge>
```

```js
badge.addEventListener('select', (e) => e.detail) // { value, selected }
badge.addEventListener('remove', (e) => e.detail) // { value }
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `tone` | `neutral` `primary` `secondary` `success` `warning` `danger` | `neutral` | color family |
| `kind` | `soft` `solid` `outline` | `soft` | treatment |
| `size` | `small` `medium` | `medium` | size |
| `label` | string | — | text (alternative to slotting children) |
| `value` | string | — | value carried in `select` / `remove` events |
| `is-dot` | boolean | — | inline status: leading dot + uppercase tracked text |
| `is-selectable` | boolean | — | make it a toggle (`role="button"`) |
| `is-selected` | boolean | — | selected state (with `is-selectable`) |
| `is-removable` | boolean | — | render a × remove button |
| `is-disabled` | boolean | — | disable |
| `is-hidden` | boolean | — | hide |

## Slots

- _(default)_ — badge content (ignored if `label` is set).
- `prefix` — leading avatar/icon (`<svg>` or `<img>`).

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `select` | `{ value, selected }` | when an `is-selectable` badge is toggled |
| `remove` | `{ value }` | when the × on an `is-removable` badge is clicked |
