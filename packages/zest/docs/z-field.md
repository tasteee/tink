# z-field

The standard label, guidance, and validation wrapper for one Zest form control.
Use it for standalone inputs, textareas, selects, and comboboxes. `z-field`
forwards its `label` to the first slotted Zest control as its accessible name,
which keeps the label working across the control's shadow DOM.

```html
<z-field label="Email address" description="Used for account notifications.">
  <z-input type="email" placeholder="you@example.com"></z-input>
</z-field>
```

## The naming rule

Every interactive form control needs an accessible name.

- Prefer `z-field label="..."` for ordinary standalone fields.
- For a compact control whose purpose is already evident nearby, pass `label`
  directly to the control: `<z-select label="Sort results">`.
- A placeholder is a hint, never a label.
- Do not rely on a separate `z-label` plus `aria-labelledby` for these controls:
  their interactive elements live in shadow DOM. `z-field` handles the
  cross-boundary naming reliably.

## Examples

### Select with guidance

```html
<z-field label="Framework" description="You can change this later.">
  <z-select placeholder="Choose a framework"></z-select>
</z-field>
```

```js
document.querySelector('z-select').options = [
  { value: 'react', label: 'React' },
  { value: 'solid', label: 'Solid' },
  { value: 'svelte', label: 'Svelte' }
]
```

### Required field with an actionable error

```html
<z-field label="Project name" is-required error="Use at least 3 characters.">
  <z-input value="Hi" is-invalid is-required></z-input>
</z-field>
```

### Visually hidden label

Use only where surrounding UI makes the field's purpose clear.

```html
<z-field label="Search projects" is-label-hidden>
  <z-input type="search" placeholder="Search projects"></z-input>
</z-field>
```

### Compact contextual control

When a full field wrapper would be visual noise, name the control directly.

```html
<z-combobox label="Filter framework" placeholder="Filter"></z-combobox>
```

## Properties & attributes

| Name | Type | Description |
| --- | --- | --- |
| `label` | string | Visible field name; forwarded to the first slotted Zest control as its accessible name. |
| `description` | string | Optional concise guidance below the control. |
| `error` | string | Optional actionable validation message; replaces `description` when supplied. |
| `is-required` | boolean | Shows a required marker beside the label. Add `is-required` to the control as well when native validation is required. |
| `is-label-hidden` | boolean | Visually hides the label while retaining it as the control's accessible name. |

## Slots

| Slot | Purpose |
| --- | --- |
| default | One form control. The first slotted element receives the forwarded label when it does not already declare a name. |
| `description` | Rich supporting content in place of the `description` string. |
| `error` | Rich validation content in place of the `error` string. |
