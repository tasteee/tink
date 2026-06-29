# z-breadcrumbs

A breadcrumb trail driven by an `items` **array property**. Non-current items are
muted links that lift to the accent on hover; the last (or any `isCurrent`) item
is plain foreground text. Items without an `href` fire `navigate` so the host can
route imperatively.

```html
<z-breadcrumbs></z-breadcrumbs>
```

```js
const crumbs = document.querySelector('z-breadcrumbs')
crumbs.items = [
  { label: 'Home', href: '/' },
  { label: 'Docs', href: '/docs' },
  { label: 'z-breadcrumbs', isCurrent: true }
]
crumbs.addEventListener('navigate', (e) => e.detail) // { value, index }
```

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `{ label, href?, isCurrent? }[]` | `[]` | **property** — the trail |
| `max` | number | — | collapse long trails to the first crumb + an ellipsis + the trailing `max - 1` |
| `tone` | `secondary` | `primary` (purple) | accent color |
| `is-hidden` | boolean | — | hide |

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `navigate` | `{ value, index }` | when a crumb without an `href` is clicked |
