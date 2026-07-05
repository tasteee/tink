import { c, css, useState, useEffect } from 'atomico'

/*
 * z-relative-time — a tiny auto-updating timestamp: "just now", "2m", "3h",
 * "Yesterday", then an absolute date once it's older than `threshold`. Every
 * chat message and conversation-list row leans on it; so do dashboards.
 *
 *   <z-relative-time datetime="2026-07-04T12:00:00Z"></z-relative-time>
 *
 * All instances share a single interval (one timer, not one-per-timestamp) and
 * expose the full absolute time on hover via the host `title`.
 */
const styles = css`
	:host {
		display: inline;
		color: inherit;
	}
	:host([is-hidden]) {
		display: none;
	}
`

const DAY = 864e5

const format = (ms: number, threshold: number): string => {
	const diff = Date.now() - ms
	if (diff < 0) return 'just now'
	const s = Math.round(diff / 1000)
	if (s < 45) return 'just now'
	const m = Math.round(s / 60)
	if (m < 60) return `${m}m`
	const h = Math.round(m / 60)
	if (h < 24) return `${h}h`
	const d = Math.round(h / 24)
	if (diff < threshold) return d === 1 ? 'Yesterday' : `${d}d`
	return new Date(ms).toLocaleDateString()
}

// One shared clock so a thread of 1000 timestamps schedules one timer, not 1000.
const subscribers = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | null = null

const subscribe = (fn: () => void, refresh: number) => {
	subscribers.add(fn)
	if (!timer) {
		timer = setInterval(() => {
			subscribers.forEach((f) => f())
		}, refresh)
	}
	return () => {
		subscribers.delete(fn)
		if (!subscribers.size && timer) {
			clearInterval(timer)
			timer = null
		}
	}
}

const toMs = (value: unknown): number => {
	if (typeof value === 'number') return value
	if (typeof value === 'string') {
		const asNumber = Number(value)
		return Number.isFinite(asNumber) && value.trim() !== '' ? asNumber : Date.parse(value)
	}
	return NaN
}

export const ZRelativeTime = c(
	(props) => {
		const [, tick] = useState(0)
		const ms = toMs(props.datetime)
		const valid = !Number.isNaN(ms)

		useEffect(() => {
			return subscribe(() => tick((n) => n + 1), (props.refresh as number) || 60000)
		}, [props.refresh])

		return (
			<host shadowDom title={valid ? new Date(ms).toLocaleString() : ''}>
				{valid ? format(ms, (props.threshold as number) || 7 * DAY) : ''}
			</host>
		)
	},
	{
		props: {
			datetime: { type: String, reflect: true },
			format: { type: String, reflect: true },
			threshold: { type: Number, reflect: true },
			refresh: { type: Number, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-relative-time', ZRelativeTime)
