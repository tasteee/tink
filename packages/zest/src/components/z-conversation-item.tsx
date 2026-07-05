import { c, css, event } from 'atomico'

/*
 * z-conversation-item — one row in the inbox rail: avatar (with presence dot),
 * name, last-message preview, timestamp, and an unread count. Composes z-avatar
 * (its `status` renders the corner dot) and z-relative-time.
 *
 *   <z-conversation-item name="Alice Rivera" preview="Did you see the designs?"
 *     timestamp="2026-07-05T12:00:00Z" status="online" unread="2"></z-conversation-item>
 *
 * Clicking emits `select` {value}. `is-active` marks the open conversation;
 * `is-muted` / `is-pinned` show the matching glyphs.
 */
const styles = css`
	:host {
		display: block;
	}
	:host([is-hidden]) {
		display: none;
	}
	.item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: background-color 0.12s ease;
	}
	.item:hover {
		background: color-mix(in oklch, var(--foreground) 6%, transparent);
	}
	:host([is-active]) .item {
		background: color-mix(in oklch, var(--primary) 14%, transparent);
	}
	.avatar {
		flex: 0 0 auto;
	}
	.body {
		flex: 1;
		min-width: 0;
	}
	.top,
	.bottom {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.name {
		flex: 1;
		min-width: 0;
		font-weight: 600;
		font-size: 0.9375rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.time {
		flex: 0 0 auto;
		font-size: 0.6875rem;
		color: var(--muted-foreground);
	}
	:host([unread]:not([unread='0'])) .time {
		color: var(--primary);
	}
	.preview {
		flex: 1;
		min-width: 0;
		font-size: 0.8125rem;
		color: var(--muted-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.muted {
		flex: 0 0 auto;
		width: 0.875rem;
		height: 0.875rem;
		color: var(--muted-foreground);
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.unread {
		flex: 0 0 auto;
		min-width: 1.125rem;
		height: 1.125rem;
		padding: 0 0.35rem;
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 999px;
		background: var(--primary);
		color: var(--primary-foreground);
		font-size: 0.6875rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
`

export const ZConversationItem = c(
	(props) => {
		const unread = Number(props.unread) || 0
		const select = () => props.select({ value: props.value })

		return (
			<host shadowDom>
				<div
					class="item"
					role="button"
					tabindex="0"
					aria-current={props.isActive ? 'true' : undefined}
					onclick={select}
					onkeydown={(e: KeyboardEvent) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							select()
						}
					}}
				>
					<z-avatar
						class="avatar"
						name={props.avatarName || props.name}
						src={props.avatarSrc}
						status={props.status}
					/>
					<div class="body">
						<div class="top">
							<span class="name">{props.name}</span>
							{props.isMuted && (
								<svg class="muted" viewBox="0 0 24 24" aria-label="Muted">
									<path d="M11 5L6 9H2v6h4l5 4V5z" />
									<path d="M23 9l-6 6M17 9l6 6" />
								</svg>
							)}
							{props.timestamp && (
								<span class="time">
									<z-relative-time datetime={props.timestamp} />
								</span>
							)}
						</div>
						<div class="bottom">
							<span class="preview">{props.preview}</span>
							{unread > 0 && <span class="unread">{unread > 99 ? '99+' : unread}</span>}
						</div>
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true },
			name: { type: String, reflect: true },
			preview: { type: String, reflect: true },
			timestamp: { type: String, reflect: true },
			avatarSrc: { type: String, reflect: true },
			avatarName: { type: String, reflect: true },
			status: { type: String, reflect: true },
			unread: { type: Number, reflect: true },
			isActive: { type: Boolean, reflect: true },
			isMuted: { type: Boolean, reflect: true },
			isPinned: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			select: event<{ value?: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-conversation-item', ZConversationItem)
