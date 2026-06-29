# z-surface

A themed container panel. `level` is the everyday path — a neutral elevation
stepped from the theme ramp (0 = page base … 3 = overlay). For accented surfaces,
`tone` picks the color family and `variant` the treatment layered on top. This
system uses borders over shadows, so "raised" reads as a lighter surface plus a
hairline ring.

```html
<z-surface level="1" radius="lg" inset="md">Panel content</z-surface>

<z-surface tone="primary" variant="soft">Accented soft panel</z-surface>

<z-surface tone="danger" variant="outlined" interactive>Clickable</z-surface>
```

## Attributes

| Attribute | Values | Default | Description |
| --- | --- | --- | --- |
| `level` | `0` `1` `2` `3` | — | neutral elevation step |
| `tone` | `plain` `neutral` `primary` `secondary` `success` `warning` `danger` | `neutral` | accent color family |
| `variant` | `plain` `filled` `soft` `outlined` `ghost` | — | treatment applied over the tone |
| `radius` | radius token / length | `lg` | corner radius — `none` `sm` `md` `lg` `xl` `2xl` `full` |
| `border` | boolean | — | force a toned hairline border |
| `elevated` | boolean | — | lighter surface + ring (shadowless elevation) |
| `interactive` | boolean | — | pointer cursor + hover border |
| `full-width` | boolean | — | `width: 100%` |
| `inset` `inset-x` `inset-y` | size token / length | `md` | inner padding |
| `hidden` | boolean | — | hide (native attribute) |

## Slots

- _(default)_ — panel content.
