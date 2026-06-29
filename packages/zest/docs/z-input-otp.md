# z-input-otp

A row of single-character cells for one-time codes. Typing auto-advances,
Backspace steps back, and pasting a full code fills every cell at once.

```html
<z-input-otp length="6" is-numeric></z-input-otp>
```

```js
const otp = document.querySelector('z-input-otp')
otp.addEventListener('change', (e) => e.detail.value)     // partial value
otp.addEventListener('complete', (e) => e.detail.value)   // all cells filled
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `value` | string | — | current code (reflected, two-way) |
| `length` | number | `6` | number of cells |
| `size` | `small` `medium` `large` | `medium` | cell size |
| `tone` | `primary` `secondary` | `primary` accent | accent color |
| `is-numeric` | boolean | — | restrict to digits + numeric keyboard |
| `is-invalid` | boolean | — | error styling |
| `is-disabled` | boolean | — | disable |
| `is-hidden` | boolean | — | hide |

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `change` | `{ value }` | on any edit |
| `complete` | `{ value }` | when every cell is filled |
