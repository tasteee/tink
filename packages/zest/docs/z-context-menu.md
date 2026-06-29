# z-context-menu

A right-click menu. Wrap the target in the default slot; a contextmenu gesture
opens a top-layer menu at the cursor, clamped to the viewport (opening
leftward/upward when it would overflow). Items come from an `items` **array
property**, the same shape as [z-menu](z-menu.md).

```html
<z-context-menu>
  <div class="canvas">Right-click me</div>
</z-context-menu>
```

```js
const menu = document.querySelector('z-context-menu')
menu.items = [
  { value: 'copy', label: 'Copy', shortcut: '⌘C' },
  { value: 'paste', label: 'Paste', shortcut: '⌘V' },
  { isSeparator: true },
  { value: 'del', label: 'Delete', isDanger: true }
]
menu.addEventListener('select', (e) => e.detail.value)
```

Keyboard: ↑/↓ move, Enter picks, Esc closes; outside-click and scroll close.

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `MenuItem[]` | `[]` | **property** — `{ value?, label?, shortcut?, isDisabled?, isSeparator?, isDanger? }` |
| `tone` | `primary` `secondary` | `primary` accent | active-item accent |
| `is-disabled` | boolean | — | disable the gesture |

## Slots

- _(default)_ — the target element(s) the menu attaches to.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `select` | `{ value }` | when an item is chosen |
