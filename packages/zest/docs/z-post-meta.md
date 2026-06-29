# z-post-meta

The byline block for a blog post: avatar, author name, publish date, and a row of
clickable tag chips. It only renders — it doesn't know about routing, so it fires
`tagclick` for the host to handle. Tags come from a `tags` **array property**.

```html
<z-post-meta
  name="Shane Colcleasure"
  avatar-src="/me.jpg"
  date="June 29, 2026"
></z-post-meta>
```

```js
const meta = document.querySelector('z-post-meta')
meta.tags = ['web-components', 'atomico', 'design-systems']
meta.addEventListener('tagclick', (e) => e.detail.tag)
```

## Properties & attributes

| Name | Type | Description |
| --- | --- | --- |
| `name` | string | author name (also drives the initials fallback) |
| `avatar-src` | string | author avatar URL (falls back to initials) |
| `date` | string | publish date text |
| `tags` | `string[]` | **property** — the tag cloud |

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `tagclick` | `{ tag }` | when a tag chip is clicked |
