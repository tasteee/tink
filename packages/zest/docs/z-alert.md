# z-alert

An inline, in-flow status banner (not a floating overlay). A bordered box tinted
by `tone`, with a leading status icon, an optional `heading`, slotted body copy,
and an optional close button.

```html
<z-alert tone="success" heading="Saved">Your changes are live.</z-alert>

<z-alert tone="danger" is-dismissable>
  Something went wrong.
</z-alert>
```

```js
alert.addEventListener('dismiss', () => {})
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `tone` | `info` `success` `warning` `danger` `neutral` | `neutral` | color + icon |
| `heading` | string | - | optional bold title; use `[slot="heading"]` for rich content (links, badges) |
| `is-dismissable` | boolean | - | show a close button |
| `is-hidden` | boolean | - | hide (set automatically on dismiss) |

`danger` / `warning` expose `role="alert"`; other tones use `role="status"`.

## Slots

- _(default)_, the body copy.

## Events

| Event | Description |
| --- | --- |
| `dismiss` | when the close button is clicked |

## Slots

| Slot | Description |
| --- | --- |
| (default) | body copy |
| `heading` | rich heading content, overrides the `heading` attribute |
| `actions` | a row of buttons under the body |
| `icon` | replaces the status icon |
