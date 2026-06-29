# z-chart

A small, dependency-free SVG chart for a single series. Feed it a `data` **array
property** (numbers, or `{ label, value }` objects) and pick a `type`. Draws on a
responsive viewBox, tints with the chart palette, and shows the value on hover.
Deliberately minimal — for dashboards and inline stats, not heavy analytics.

```html
<z-chart type="bar" show-grid height="220px"></z-chart>
```

```js
const chart = document.querySelector('z-chart')
chart.data = [12, 19, 7, 22, 15]
// or: chart.data = [{ label: 'Jan', value: 12 }, { label: 'Feb', value: 19 }]
```

## Properties & attributes

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `number[] \| { label, value }[]` | `[]` | **property** — the series |
| `type` | `bar` `line` `area` | `bar` | chart type |
| `tone` | `secondary` `success` | `chart-1` | accent color |
| `height` | CSS length | `240px` | chart height |
| `show-grid` | boolean | — | draw horizontal grid lines |
| `hide-labels` | boolean | — | hide the x-axis labels |
| `is-hidden` | boolean | — | hide |

## Slots

None.
