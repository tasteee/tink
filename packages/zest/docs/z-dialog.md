# z-dialog

A modal built on the native `<dialog>` element, so focus trapping, Esc-to-close,
top-layer stacking, and the backdrop all come from the platform. An optional
`[slot="trigger"]` opens it; `heading` / `description` (or slotted content) fill
the body; a `[slot="footer"]` holds actions.

```html
<z-dialog heading="Edit profile" description="Update your details.">
  <z-button slot="trigger">Edit</z-button>

  <z-input placeholder="Name"></z-input>

  <div slot="footer">
    <z-button kind="outline" tone="neutral">Cancel</z-button>
    <z-button tone="primary">Save</z-button>
  </div>
</z-dialog>
```

```js
// open/close imperatively
dialog.isOpen = true
dialog.addEventListener('open', () => {})
dialog.addEventListener('close', () => {})
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `is-open` | boolean | — | open state (reflected, two-way) |
| `heading` | string | — | title |
| `description` | string | — | sub-text below the title |
| `size` | `small` `medium` `large` | `medium` | width (24 / 30 / 42 rem) |
| `tone` | `primary` `secondary` | — | accent |
| `hide-close` | boolean | — | hide the × close button |
| `is-static` | boolean | — | disable backdrop-click dismiss |
| `is-disabled` | boolean | — | prevent the trigger from opening |

## Slots

- `trigger` — element that opens the dialog.
- _(default)_ — dialog body.
- `footer` — action row (hidden when empty).

## Events

| Event | Description |
| --- | --- |
| `open` | when the dialog opens |
| `close` | when the dialog closes |
