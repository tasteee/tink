import { c, css, useState } from 'atomico'

/*
 * z-avatar — a circular identity mark. Shows an image when `src` loads, and
 * gracefully falls back to initials (derived from `name` or given via
 * `initials`) on a tinted ground. Optional status dot in the corner. No
 * shadows — a hairline ring separates it from busy backgrounds.
 */
const styles = css`
	:host {
		display: inline-flex;
		vertical-align: middle;
		position: relative;
		--size: 2.5rem;
		--tone: var(--purple);
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([tone='secondary']) {
		--tone: var(--pink);
	}
	:host([tone='neutral']) {
		--tone: var(--color-neutral-5);
	}

	:host([size='xs']) {
		--size: 1.5rem;
	}
	:host([size='small']) {
		--size: 2rem;
	}
	:host([size='large']) {
		--size: 3.25rem;
	}
	:host([size='xl']) {
		--size: 4rem;
	}

	.avatar {
		width: var(--size);
		height: var(--size);
		border-radius: 999px;
		overflow: hidden;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		border: 1px solid color-mix(in oklch, var(--foreground) 14%, transparent);
		/* srgb: mixing a chromatic tone with the hue-carrying --card in oklch
		   drifts the hue around the wheel. */
		background: color-mix(in srgb, var(--tone) 22%, var(--card));
		color: color-mix(in oklch, var(--tone) 85%, white);
		font-family: inherit;
		font-weight: 600;
		font-size: calc(var(--size) * 0.4);
		line-height: 1;
		user-select: none;
	}

	:host([is-square]) .avatar {
		border-radius: var(--radius-md);
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.status {
		position: absolute;
		right: 0;
		bottom: 0;
		width: calc(var(--size) * 0.28);
		height: calc(var(--size) * 0.28);
		border-radius: 999px;
		border: 2px solid var(--background);
		box-sizing: border-box;
	}
	.status.is-online {
		background: var(--success);
	}
	.status.is-busy {
		background: var(--destructive);
	}
	.status.is-away {
		background: var(--warning);
	}
	.status.is-offline {
		background: var(--color-neutral-5);
	}
`

const getInitials = (props: any): string => {
	if (props.initials) return props.initials.slice(0, 2).toUpperCase()
	if (!props.name) return '?'
	const parts = String(props.name).trim().split(/\s+/)
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const ZAvatar = c(
	(props) => {
		const [failed, setFailed] = useState(false)
		const showImage = props.src && !failed

		return (
			<host shadowDom>
				<span class="avatar" aria-label={props.name}>
					{showImage ? (
						<img src={props.src} alt={props.name || ''} onerror={() => setFailed(true)} />
					) : (
						<span aria-hidden="true">{getInitials(props)}</span>
					)}
				</span>
				{props.status && <span class={`status is-${props.status}`} aria-hidden="true"></span>}
			</host>
		)
	},
	{
		props: {
			src: String,
			name: String,
			initials: String,
			status: { type: String, reflect: true },
			size: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			isSquare: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-avatar', ZAvatar)
