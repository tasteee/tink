# z-sidebar

A vertical navigation rail driven by an `items` **array property**. Entries are
either links or groups (a labeled set of links). A group's items are always
rendered alphabetically by label, and its label doubles as a disclosure trigger
— click it to collapse/expand that group (open by default). The entry whose
`value` matches the `value` prop is marked active. `header` and `footer` slots
bracket the nav — their reserved padding/border only appear once something is
actually slotted in, so an unused slot doesn't leave dead space. `is-collapsed`
shrinks it to an icon rail, and `is-docked` strips the card look (background,
border, radius, inline padding) down to a flush rail with a hairline trailing
border, for docking flush against a page edge — position it with your own CSS
(e.g. `position: fixed; left: 0`).

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
| `is-docked` | boolean | — | flush rail (no background/border/radius/inline padding), hairline trailing border — for docking to a page edge |

**Link:** `{ value?, label, href?, icon?, badge? }` (`icon` is an HTML string).
**Group:** `{ label?, items: Link[] }`.

The width is themeable via `--z-sidebar-width` / `--z-sidebar-collapsed-width`.

## Slots

- `header` — content above the nav (e.g. a logo) — pinned in place, doesn't scroll.
- `footer` — content pinned to the bottom (e.g. account/settings) — also doesn't scroll.

Only the nav between them scrolls when its content overflows, so this can double
as a full site nav bar — logo up top, account row at the bottom, links scrolling
in between. This requires the host to have a bounded height (e.g. `height: 100%`
inside a fixed-height ancestor); without one, the nav has nothing to scroll
within and simply grows.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `select` | `{ value }` | when a link without an `href` is chosen |
