# z-toast

A toaster region that stacks transient notifications. Place one on the page, then
push toasts **imperatively** via its `push()` method.

```html
<z-toast position="bottom-end"></z-toast>
```

```js
const toaster = document.querySelector('z-toast')

const id = toaster.push({
  title: 'Saved',
  description: 'Your changes are live.',
  tone: 'success',
  duration: 4000   // 0 = sticky (no auto-dismiss)
})

toaster.dismiss(id)  // dismiss early
toaster.addEventListener('dismiss', (e) => e.detail.id)
```

## Methods

| Method | Description |
| --- | --- |
| `push(input)` | show a toast; returns its numeric id. `input`: `{ title?, description?, tone?, duration? }` (tone: `info` `success` `warning` `danger`; default `duration` 4000ms) |
| `dismiss(id)` | remove a toast by id |

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `position` | `bottom-end` `bottom-start` `bottom-center` `top-end` `top-start` `top-center` | `bottom-end` | corner the stack parks in |

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `dismiss` | `{ id }` | when a toast leaves (auto-expire or manual) |
