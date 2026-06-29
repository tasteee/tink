import { c, css } from 'atomico'

/*
 * z-progress — a slim linear meter. Hairline track, accent-filled bar. Supports
 * a determinate value (0–max) or an indeterminate sweep (is-indeterminate).
 * No shadows; the fill is a flat accent band.
 */
const styles = css`
	:host {
		display: block;
		width: 100%;
		--accent: var(--color-neutral-8);
	}

	:host([tone='secondary']) {
		--accent: var(--pink);
	}

	:host([tone='success']) {
		--accent: var(--success);
	}
	:host([tone='danger']) {
		--accent: var(--destructive);
	}

	:host([is-hidden]) {
		display: none;
	}

	.track {
		position: relative;
		width: 100%;
		height: var(--bar-height, 0.5rem);
		background: color-mix(in oklch, var(--border) 70%, transparent);
		border-radius: 999px;
		overflow: hidden;
	}

	:host([size='small']) .track {
		--bar-height: 0.3125rem;
	}
	:host([size='large']) .track {
		--bar-height: 0.75rem;
	}

	.bar {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		border-radius: 999px;
		background: var(--accent);
		transition: width 0.3s var(--easing-standard, ease-out);
	}

	.track.is-indeterminate .bar {
		width: 35% !important;
		animation: z-progress-sweep 1.2s ease-in-out infinite;
	}

	@keyframes z-progress-sweep {
		0% {
			left: -35%;
		}
		100% {
			left: 100%;
		}
	}
`

export const ZProgress = c(
	(props) => {
		const max = props.max ?? 100
		const value = Math.max(0, Math.min(props.value ?? 0, max))
		const pct = max > 0 ? (value / max) * 100 : 0

		return (
			<host
				shadowDom
				role='progressbar'
				aria-valuemin='0'
				aria-valuemax={String(max)}
				aria-valuenow={props.isIndeterminate ? undefined : String(value)}
			>
				<div class={props.isIndeterminate ? 'track is-indeterminate' : 'track'}>
					<div class='bar' style={{ width: `${pct}%` }}></div>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: Number, reflect: true },
			max: { type: Number, reflect: true },
			tone: { type: String, reflect: true },
			size: { type: String, reflect: true },
			isIndeterminate: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-progress', ZProgress)
