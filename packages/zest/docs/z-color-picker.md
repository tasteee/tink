# z-color-picker

A swatch trigger that opens a bordered, shadow-free panel with the native
spectrum picker, a hex field, and a row of preset swatches. `value` is a hex
string like `#BF40BF`.

```html
<z-color-picker value="#BF40BF"></z-color-picker>
```

```js
const picker = document.querySelector('z-color-picker')
// optional custom presets (defaults to the zest palette)
picker.presets = ['#FAFAFA', '#BF40BF', '#FF1493', '#0A0F0A']
picker.addEventListener('change', (e) => e.detail.value)
```

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | string (hex) | `#BF40BF` | current color (reflected attribute, two-way) |
| `presets` | `string[]` | zest palette | **property** — preset swatches |
| `tone` | `primary` `secondary` | `primary` accent | accent color |
| `is-disabled` | boolean | — | disable |
| `is-hidden` | boolean | — | hide |

## Events

| Event | `detail` | Description |
| --- | --- | --- |
| `change` | `{ value }` | whenever the color changes (spectrum, hex field, or preset) |
