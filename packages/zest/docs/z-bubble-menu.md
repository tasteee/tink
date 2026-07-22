# z-bubble-menu

A floating contextual menu with three variants, switched via `variant`. Use
one instance per variant (each a singleton, positioned like
`z-selection-toolbar`), and show only the one that applies.

```html
<z-bubble-menu variant="link"></z-bubble-menu>
<z-bubble-menu variant="image"></z-bubble-menu>
<z-bubble-menu variant="table-cell"></z-bubble-menu>
```

```js
const linkBubble = document.querySelector('z-bubble-menu[variant="link"]')

// when the cursor is inside a link, show the link bubble instead of
// z-selection-toolbar — this component doesn't coordinate that on its own,
// the host decides and keeps them mutually exclusive
linkBubble.url = currentLink.href
linkBubble.anchorRect = currentLink.getBoundingClientRect()
linkBubble.isOpen = true

linkBubble.addEventListener('linkchange', (e) => setLinkUrl(e.detail.url))
linkBubble.addEventListener('linkopen', () => window.open(currentLink.href, '_blank'))
linkBubble.addEventListener('linkunlink', () => removeLink())
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `variant` | `link` `image` `table-cell` | `link` | which control set to render |
| `placement` | `top` `bottom` `left` `right` (+ `-start`/`-end`) | `top` | preferred side |
| `offset` | number (px) | `10` | gap from `anchorRect` |
| `is-open` | boolean | — | show/hide |

## Properties

- `anchorRect` — a `DOMRect`-like object to position against
- `url` — current link URL (`link` variant)
- `align` — `left` `center` `right` (`image` variant)
- `hasCaption` — boolean (`image` variant)

## Events

| Variant | Event | `detail` | Description |
| --- | --- | --- | --- |
| link | `linkchange` | `{ url }` | the inline URL field was edited |
| link | `linkopen` | — | open button pressed |
| link | `linkunlink` | — | unlink button pressed |
| image | `imagealign` | `{ align }` | alignment button pressed |
| image | `imagecaptiontoggle` | — | caption toggle pressed |
| image | `imagereplace` | — | replace button pressed |
| image | `imagedelete` | — | delete button pressed |
| table-cell | `tableinsertrow` | `{ position: 'before' \| 'after' }` | insert a row |
| table-cell | `tabledeleterow` | — | delete the current row |
| table-cell | `tableinsertcolumn` | `{ position: 'before' \| 'after' }` | insert a column |
| table-cell | `tabledeletecolumn` | — | delete the current column |
| table-cell | `tablemerge` | — | merge selected cells |

## Interaction notes

- **Link bubble takes priority over the selection toolbar** — if the cursor is
  inside a link, open the link bubble and keep `z-selection-toolbar.isOpen`
  false. Both float via the same anchor-rect mechanism, so swapping between
  them is just toggling `isOpen` on each.
- The link field's own `mousedown` doesn't collapse the selection, same as
  `z-selection-toolbar`.
