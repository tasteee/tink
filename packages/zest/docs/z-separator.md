# z-separator

A hairline divider that can carry a centered label — the richer sibling of
[z-line](z-line.md). With no label it collapses to a single full-width rule.

```html
<z-separator label="OR"></z-separator>

<!-- richer label via slot -->
<z-separator>
  <z-badge>Section</z-badge>
</z-separator>

<z-separator is-vertical></z-separator>
```

## Attributes

| Attribute | Type | Description |
| --- | --- | --- |
| `label` | string | text shown centered in the rule |
| `is-vertical` | boolean | vertical orientation (full height) |
| `is-hidden` | boolean | hide the separator |

Exposes `role="separator"` with the matching `aria-orientation`.

## Slots

- _(default)_ — custom label content (used when `label` is not set).
