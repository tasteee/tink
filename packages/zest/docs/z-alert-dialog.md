# z-alert-dialog

A confirmation modal for destructive or consequential choices. Same native
`<dialog>` foundation as [z-dialog](z-dialog.md), but it owns its two actions
(cancel + confirm) and is intentionally **not** light-dismissable: clicking the
backdrop does nothing, and Esc resolves as an explicit cancel.

```html
<z-alert-dialog
  heading="Delete project?"
  description="This action cannot be undone."
  tone="danger"
  confirm-label="Delete"
>
  <z-button slot="trigger" tone="danger">Delete</z-button>
</z-alert-dialog>
```

```js
dialog.addEventListener('confirm', () => deleteProject())
dialog.addEventListener('cancel', () => {})
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `is-open` | boolean | — | open state (reflected, two-way) |
| `heading` | string | — | title |
| `description` | string | — | body text |
| `confirm-label` | string | `Confirm` | confirm button text |
| `cancel-label` | string | `Cancel` | cancel button text |
| `tone` | `danger` `secondary` `primary` | `primary` | confirm-button color |

## Slots

- `trigger` — element that opens the dialog.
- _(default)_ — extra body content below the description.

## Events

| Event | Description |
| --- | --- |
| `confirm` | when the confirm action is chosen |
| `cancel` | when cancelled (button, or Esc) |
