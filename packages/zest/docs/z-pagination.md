# z-pagination

Numbered page navigation with prev/next arrows and ellipsis truncation. Drive it
with `page` (1-based) and `total` (page count); tune the visible window with
`sibling-count`.

```html
<z-pagination page="3" total="20"></z-pagination>
<z-pagination page="1" total="50" sibling-count="2" tone="primary"></z-pagination>
```

```js
pagination.addEventListener('change', (e) => e.detail.page)
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `page` | number | `1` | current page (reflected, two-way) |
| `total` | number | `1` | total page count |
| `sibling-count` | number | `1` | pages shown on each side of the current page |
| `tone` | `primary` `secondary` | `primary` accent | current-page accent |
| `is-hidden` | boolean | — | hide |

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `change` | `{ page }` | when the page changes |
