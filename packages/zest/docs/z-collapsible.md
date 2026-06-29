# z-collapsible

A single disclosure section. A trigger row (the `label`, or a `[slot="trigger"]`
for richer content) toggles a content region (the default slot). Fires `toggle`
so a parent [z-accordion](z-accordion.md) can coordinate open/close behaviour.

```html
<z-collapsible label="Shipping & returns">
  <p>Free returns within 30 days.</p>
</z-collapsible>

<z-collapsible is-open>
  <span slot="trigger"><strong>Custom</strong> trigger</span>
  <p>Body content.</p>
</z-collapsible>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `label` | string | — | trigger text (when not using the `trigger` slot) |
| `value` | string | — | identifier carried in the `toggle` event |
| `tone` | `primary` `secondary` | `primary` accent | accent color |
| `is-open` | boolean | — | open state (reflected, two-way) |
| `is-disabled` | boolean | — | disable |
| `is-hidden` | boolean | — | hide |

## Slots

- _(default)_ — the collapsible content.
- `trigger` — custom trigger content (overrides `label`).

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `toggle` | `{ value, open }` | when toggled |
