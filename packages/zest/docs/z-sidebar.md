# z-sidebar

A vertical navigation rail driven by an `items` **array property**. Entries are
either links or groups (a labeled set of links). The entry whose `value` matches
the `value` prop is marked active. `header` and `footer` slots bracket the nav,
and `is-collapsed` shrinks it to an icon rail.

```html
<z-sidebar value="inbox">
  <div slot="header">Logo</div>
  <div slot="footer">Account</div>
</z-sidebar>
```

```js
const sidebar = document.querySelector('z-sidebar')
sidebar.items = [
  { value: 'inbox', label: 'Inbox', icon: '<svg>…</svg>', badge: '12' },
  {
    label: 'Workspace',
    items: [
      { value: 'projects', label: 'Projects' },
      { value: 'team', label: 'Team' }
    ]
  }
]
sidebar.addEventListener('select', (e) => e.detail.value)
```

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `(Link \| Group)[]` | `[]` | **property** — see shapes below |
| `value` | string | — | the active entry's value |
| `tone` | `secondary` | `primary` (purple) | accent color |
| `is-collapsed` | boolean | — | shrink to an icon rail |
| `is-hidden` | boolean | — | hide |

**Link:** `{ value?, label, href?, icon?, badge? }` (`icon` is an HTML string).
**Group:** `{ label?, items: Link[] }`.

The width is themeable via `--z-sidebar-width` / `--z-sidebar-collapsed-width`.

## Slots

- `header` — content above the nav.
- `footer` — content pinned to the bottom.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `select` | `{ value }` | when a link without an `href` is chosen |
