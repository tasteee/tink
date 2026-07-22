# z-number-input

A numeric field with live validation, blur-time correction, and optional ghost
stepper buttons. It has the same outlined treatment and small/medium/large
heights as Zest selects and buttons.

```html
<z-field label="Playback speed">
  <z-number-input value="1" min="0.5" max="2" step="0.25" has-stepper-buttons></z-number-input>
</z-field>
```

`value`, `min`, `max`, and `step` are numeric properties. Their HTML attributes
are strings as usual, but Zest coerces them to numbers; integer and decimal
steps both work. `step` must be positive and defaults to `1`.

## Behavior

- Click or tab into the input to focus and select its current value.
- The optional minus and plus buttons, and ArrowDown/ArrowUp, change by exactly
  one `step` and clamp at `min`/`max`.
- While typing, non-numeric and out-of-range values stay visible but receive the
  invalid treatment.
- On blur, a numeric value clamps to `min`/`max`; invalid text restores the last
  numeric value (or the minimum when no value exists).

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | number | — | Current numeric value. |
| `min` / `max` | number | — | Optional inclusive bounds. |
| `step` | number | `1` | Positive increment/decrement amount; decimal values are supported. |
| `has-stepper-buttons` | boolean | — | Shows ghost decrement/increment buttons inside the field. |
| `is-full-width` | boolean | — | Stretches the normally compact numeric field to its container width. |
| `size` | `small` `medium` `large` | `medium` | Matches the same size of `z-button` and `z-select`. |
| `label` | string | — | Accessible name for compact contextual use. Prefer `z-field` for a visible label. |
| `is-invalid` / `is-disabled` / `is-readonly` | boolean | — | External invalid state, disabled state, or read-only state. |

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `input` | `{ value: number \| null, rawValue: string, isValid: boolean }` | Fires on every keystroke, including invalid intermediate values. |
| `change` | `{ value: number }` | Fires after a blur correction or step action. |
