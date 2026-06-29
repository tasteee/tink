# z-drawer

A bottom drawer (vaul-style) on the native `<dialog>` foundation: rounded top, a
grab handle, and drag-to-dismiss. Shares [z-dialog](z-dialog.md)'s chrome and
modal behaviour — pull the handle down past a threshold to close, or release
short to snap back.

```html
<z-drawer heading="Quick actions">
  <z-button slot="trigger">Open drawer</z-button>

  <z-stack gap="sm">
    <z-button kind="ghost">Share</z-button>
    <z-button kind="ghost">Duplicate</z-button>
  </z-stack>
</z-drawer>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `is-open` | boolean | — | open state (reflected, two-way) |
| `heading` | string | — | title |
| `description` | string | — | sub-text |
| `tone` | `primary` `secondary` | — | accent |
| `is-static` | boolean | — | disable backdrop-click dismiss |
| `is-disabled` | boolean | — | prevent the trigger from opening |

## Slots

- `trigger` — element that opens the drawer.
- _(default)_ — drawer body.
- `footer` — action row (hidden when empty).

## Events

| Event | Description |
| --- | --- |
| `open` | when the drawer opens |
| `close` | when the drawer closes (including drag-dismiss) |
