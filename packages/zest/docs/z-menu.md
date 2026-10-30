# z-menu

A dropdown menu. The trigger is whatever you slot into `[slot="trigger"]`
(typically a [z-button](z-button.md)). Rows are declarative `<z-menu-item>`
children (their content becomes the row) or an `items` **array property**.

```html
<z-menu>
  <z-button slot="trigger">Actions</z-button>
  <z-menu-item value="edit" shortcut="⌘E">Edit</z-menu-item>
  <z-menu-item value="dup">Duplicate</z-menu-item>
  <z-menu-separator></z-menu-separator>
  <z-menu-item value="del" is-danger>Delete</z-menu-item>
</z-menu>
```

```js
menu.addEventListener('select', (e) => e.detail.value)
// or, data-driven:
menu.items = [{ value: 'edit', label: 'Edit' }, { isSeparator: true }, { value: 'del', label: 'Delete', isDanger: true }]
```

Picking a row double-flashes it (~130ms, skipped under reduced motion); then the
menu closes and fires `select`.

Keyboard: ↑/↓ move (skipping separators/disabled), Enter/Space pick, Esc closes.

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `MenuItem[]` | `[]` | **property**, see shape below |
| `align` | `start` `end` | `start` | which edge the panel aligns to |
| `tone` | `primary` `secondary` | `primary` accent | active-item accent |
| `is-hidden` | boolean | - | hide |

**MenuItem:** `{ value?, label?, icon?, shortcut?, isDisabled?, isSeparator?, isDanger? }`
(`icon` is an HTML string rendered inline).

## Slots

- `trigger`: the element that opens the menu.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `select` | `{ value }` | when an item is chosen |
