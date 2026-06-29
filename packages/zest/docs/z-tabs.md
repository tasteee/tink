# z-tabs

A tab list driven by a `tabs` **array property**. Panels are provided as named
slots whose name matches each tab's `value`. The active tab carries an accent
underline; only the active panel renders.

```html
<z-tabs id="t">
  <div slot="overview">Overview content</div>
  <div slot="specs">Specs content</div>
</z-tabs>
```

```js
const tabs = document.querySelector('#t')
tabs.tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'specs', label: 'Specs' }
]
tabs.addEventListener('change', (e) => e.detail.value)
```

Keyboard: ←/→ move (skipping disabled), Home/End jump to the ends.

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `tabs` | `{ value, label, isDisabled? }[]` | `[]` | **property** — the tab list |
| `value` | string | first tab | active tab value (reflected attribute, two-way) |
| `tone` | `primary` `secondary` | `primary` accent | underline color |
| `is-fitted` | boolean | — | tabs stretch to fill the width equally |
| `is-hidden` | boolean | — | hide |

## Slots

- _(named)_ — one slot per tab, named after the tab's `value`.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `change` | `{ value }` | on tab change |
