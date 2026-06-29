# z-sheet

A panel that slides in from an edge. Same native `<dialog>` foundation as
[z-dialog](z-dialog.md) — modal focus trap, Esc, backdrop — and reuses its
body/header/footer chrome; only the geometry and slide transition differ.

```html
<z-sheet heading="Filters" side="right">
  <z-button slot="trigger">Filters</z-button>

  <!-- filter controls -->

  <div slot="footer">
    <z-button tone="primary">Apply</z-button>
  </div>
</z-sheet>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `is-open` | boolean | — | open state (reflected, two-way) |
| `side` | `right` `left` `top` `bottom` | `right` | edge it slides from |
| `heading` | string | — | title |
| `description` | string | — | sub-text |
| `tone` | `primary` `secondary` | — | accent |
| `hide-close` | boolean | — | hide the × button |
| `is-static` | boolean | — | disable backdrop-click dismiss |
| `is-disabled` | boolean | — | prevent the trigger from opening |

Size is themeable via `--z-sheet-size` (default `22rem`).

## Slots

- `trigger` — element that opens the sheet.
- _(default)_ — sheet body.
- `footer` — action row (hidden when empty).

## Events

| Event | Description |
| --- | --- |
| `open` | when the sheet opens |
| `close` | when the sheet closes |
