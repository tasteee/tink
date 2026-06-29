# z-nav-menu

A horizontal navigation bar driven by an `items` **array property**. Top-level
items with `children` open a bordered dropdown panel on click; plain items are
links. The active top item (matched against `value`) is accent-colored.

```html
<z-nav-menu value="products"></z-nav-menu>
```

```js
const nav = document.querySelector('z-nav-menu')
nav.items = [
  { value: 'home', label: 'Home', href: '/' },
  {
    value: 'products', label: 'Products',
    children: [
      { value: 'app', label: 'App', href: '/app', description: 'The main app' },
      { value: 'api', label: 'API', href: '/api' }
    ]
  }
]
nav.addEventListener('select', (e) => e.detail.value)
```

Esc / outside-click closes any open panel.

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `NavItem[]` | `[]` | **property** — see shape below |
| `value` | string | — | the active top-level item's value |
| `tone` | `secondary` | `primary` (purple) | accent color |
| `is-hidden` | boolean | — | hide |

**NavItem:** `{ value?, label, href?, children? }` where each child is
`{ value?, label, href?, description? }`.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `select` | `{ value }` | when an item without an `href` is chosen |
