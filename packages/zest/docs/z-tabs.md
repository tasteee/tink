# z-tabs

A tab list plus, optionally, its panels. Declare tabs as `<z-tab>` children
(their content is the label) or set a `tabs` **array property**.

**Compound:** give panels slots named after their tab's `value`; only the active
one renders, wired up as the tabpanel.

```html
<z-tabs value="overview">
  <z-tab value="overview">Overview</z-tab>
  <z-tab value="specs">Specs</z-tab>
  <div slot="overview">Overview content</div>
  <div slot="specs">Specs content</div>
</z-tabs>
```

**Controller:** leave the panels out and z-tabs is just the tablist. Read
`value` or listen for `change` and render content anywhere.

```js
tabs.addEventListener('change', (e) => showPanel(e.detail.value))
```

Keyboard: ←/→ move (skipping disabled), Home/End jump to the ends.

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `tabs` | `{ value, label, isDisabled? }[]` | `[]` | **property**, the tab list |
| `value` | string | first tab | active tab value (reflected attribute, two-way) |
| `tone` | `primary` `secondary` | `primary` accent | underline color |
| `is-fitted` | boolean | - | tabs stretch to fill the width equally |
| `is-hidden` | boolean | - | hide |

## Slots

- _(named)_, one slot per tab, named after the tab's `value`.

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `change` | `{ value }` | on tab change |
