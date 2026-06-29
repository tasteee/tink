import { c, css, useState, useEffect, useHost } from 'atomico'

/*
 * z-chart — a small, dependency-free SVG chart for a single series. Feed it a
 * `data` array (numbers, or { label, value }) and pick a `type`: bar | line |
 * area. Draws on a responsive viewBox, tints with the chart palette via `tone`,
 * and shows the value on hover. Deliberately minimal — for dashboards and
 * inline stats, not heavy analytics.
 */
const styles = css`
	:host {
		display: block;
		--accent: var(--chart-1);
	}

	:host([tone='secondary']) {
		--accent: var(--chart-2);
	}
	:host([tone='success']) {
		--accent: var(--success);
	}

	:host([is-hidden]) {
		display: none;
	}

	svg {
		display: block;
		width: 100%;
		height: var(--z-chart-height, 240px);
		overflow: visible;
	}

	.grid {
		stroke: var(--border);
		stroke-width: 1;
	}

	.bar {
		fill: var(--accent);
		transition: opacity 0.12s ease;
	}

	.bar.is-dim {
		opacity: 0.45;
	}

	.area {
		fill: var(--accent);
		opacity: 0.14;
	}

	.line {
		fill: none;
		stroke: var(--accent);
		stroke-width: 2.5;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	.point {
		fill: var(--background);
		stroke: var(--accent);
		stroke-width: 2.5;
	}

	.x-label {
		fill: var(--muted-foreground);
		font-family: var(--font-sans);
		font-size: 11px;
		text-anchor: middle;
	}

	.value {
		fill: var(--foreground);
		font-family: var(--font-sans);
		font-size: 12px;
		font-weight: 600;
		text-anchor: middle;
	}

	.hit {
		fill: transparent;
		cursor: pointer;
	}
`

type Point = { label: string; value: number }

const normalize = (data: any): Point[] => {
	if (!Array.isArray(data)) return []
	return data.map((d, i) =>
		typeof d === 'number' ? { label: String(i + 1), value: d } : { label: String(d?.label ?? i + 1), value: Number(d?.value) || 0 }
	)
}

const PAD_X = 16
const PAD_TOP = 24
const PAD_BOTTOM = 28

export const ZChart = c(
	(props) => {
		const host = useHost()
		const [hover, setHover] = useState(-1)
		// measure the host so the viewBox maps 1:1 to pixels — preserveAspectRatio
		// "none" then introduces no distortion, and the chart fills its container.
		const [size, setSize] = useState({ w: 640, h: 240 })

		useEffect(() => {
			const el = host.current
			const measure = () => {
				const rect = el.getBoundingClientRect()
				if (rect.width && rect.height) setSize({ w: Math.round(rect.width), h: Math.round(rect.height) })
			}
			measure()
			if (typeof ResizeObserver === 'undefined') return
			const ro = new ResizeObserver(measure)
			ro.observe(el)
			return () => ro.disconnect()
		}, [])

		const points = normalize(props.data)
		const W = size.w
		const H = size.h
		const type = (props.type as string) || 'bar'
		const chartW = W - PAD_X * 2
		const chartH = H - PAD_TOP - PAD_BOTTOM
		const max = Math.max(1, ...points.map((p) => p.value))
		const showLabels = !props.hideLabels

		const yOf = (v: number) => PAD_TOP + chartH - (v / max) * chartH
		const slot = points.length > 0 ? chartW / points.length : chartW
		const cxOf = (i: number) => PAD_X + slot * i + slot / 2

		const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => PAD_TOP + chartH * t)

		const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${cxOf(i).toFixed(1)} ${yOf(p.value).toFixed(1)}`).join(' ')
		const areaPath =
			points.length > 0
				? `${linePath} L ${cxOf(points.length - 1).toFixed(1)} ${(PAD_TOP + chartH).toFixed(1)} L ${cxOf(0).toFixed(1)} ${(
						PAD_TOP + chartH
				  ).toFixed(1)} Z`
				: ''

		const barWidth = slot * 0.6

		return (
			<host shadowDom style={{ '--z-chart-height': props.height || '' }}>
				<svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img">
					{props.showGrid &&
						gridLines.map((y, i) => <line key={`g-${i}`} class="grid" x1={PAD_X} y1={y} x2={W - PAD_X} y2={y} />)}

					{type === 'area' && areaPath && <path class="area" d={areaPath} />}
					{(type === 'line' || type === 'area') && linePath && <path class="line" d={linePath} />}

					{points.map((p, i) => {
						const cx = cxOf(i)
						const y = yOf(p.value)
						return (
							<g key={i} onmouseenter={() => setHover(i)} onmouseleave={() => setHover(-1)}>
								{type === 'bar' && (
									<rect
										class={hover === -1 || hover === i ? 'bar' : 'bar is-dim'}
										x={cx - barWidth / 2}
										y={y}
										width={barWidth}
										height={PAD_TOP + chartH - y}
										rx="4"
									/>
								)}
								{(type === 'line' || type === 'area') && <circle class="point" cx={cx} cy={y} r="4" />}
								{/* full-height hit target for reliable hover */}
								<rect class="hit" x={cx - slot / 2} y={PAD_TOP} width={slot} height={chartH} />
								{hover === i && (
									<text class="value" x={cx} y={y - 10}>
										{p.value}
									</text>
								)}
								{showLabels && (
									<text class="x-label" x={cx} y={H - 8}>
										{p.label}
									</text>
								)}
							</g>
						)
					})}
				</svg>
			</host>
		)
	},
	{
		props: {
			data: { type: Array },
			type: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			height: String,
			showGrid: { type: Boolean, reflect: true },
			hideLabels: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-chart', ZChart)
