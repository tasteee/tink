# z-toggle-group-item

A single item inside a [z-toggle-group](z-toggle-group.md). Carries a `value` and
a pressed state; it inherits tone/size/kind from the parent group but can
override any of them with its own variant flags.

```html
<z-toggle-group>
  <z-toggle-group-item value="bold" is-pressed>B</z-toggle-group-item>
  <z-toggle-group-item value="italic">I</z-toggle-group-item>
</z-toggle-group>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `value` | string | — | identifies this item in the group's `change` event |
| `is-pressed` | boolean | — | pressed state (reflected, two-way) |
| `is-disabled` | boolean | — | disable |
| `is-hidden` | boolean | — | hide |
| _color_ | `is-purple` `is-pink` `is-neutral` | inherit | override tone |
| _size_ | `is-small` `is-medium` `is-large` | inherit | override size |
| _kind_ | `is-ghost` `is-outlined` | inherit | override treatment |
| `is-icon` | boolean | — | square icon-only item |

## Slots

- _(default)_ — label and/or icon.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `press` | `{ pressed, value }` | consumed by the parent group to drive its `change` event |
