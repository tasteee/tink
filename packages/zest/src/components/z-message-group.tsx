import { c, css, useHost, useEffect } from 'atomico'

/*
 * z-message-group — a run of consecutive messages from one sender, sharing a
 * single avatar, name, and timestamp. It positions its slotted
 * z-message-bubble children (sets their `side` and `group` corner position) so
 * you don't repeat that on every bubble.
 *
 *   <z-message-group side="start" name="Alice" avatar-name="Alice" timestamp="2026-07-04T18:00:00Z">
 *     <z-message-bubble>Hey!</z-message-bubble>
 *     <z-message-bubble>Did you see the designs?</z-message-bubble>
 *   </z-message-group>
 *
 * `side="end"` is you (right-aligned, no avatar by default). Avatars show on the
 * `start` side; toggle with `hide-avatar` / `show-avatar`.
 */
const styles = css`
	:host {
		display: block;
	}
	:host([is-hidden]) {
		display: none;
	}

	.row {
		display: flex;
		align-items: flex-end;
		gap: var(--space-sm);
		padding: 0.125rem 0;
	}
	:host([side='end']) .row {
		flex-direction: row-reverse;
	}

	.avatar {
		flex: 0 0 auto;
	}

	.col {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		max-width: min(75%, 42rem);
	}
	:host([side='end']) .col {
		align-items: flex-end;
	}
	:host([side='start']) .col,
	:host(:not([side='end'])) .col {
		align-items: flex-start;
	}

	.name {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--muted-foreground);
		margin: 0 0.5rem 2px;
	}
	.meta {
		font-size: 0.6875rem;
		color: var(--muted-foreground);
		margin: 2px 0.5rem 0;
	}
`

export const ZMessageGroup = c(
	(props) => {
		const host = useHost()

		useEffect(() => {
			const el = host.current as HTMLElement
			const side = props.side === 'end' ? 'end' : 'start'
			const apply = () => {
				const bubbles = [...el.querySelectorAll(':scope > z-message-bubble')]
				bubbles.forEach((b, i) => {
					b.setAttribute('side', side)
					const pos =
						bubbles.length === 1
							? 'single'
							: i === 0
								? 'first'
								: i === bubbles.length - 1
									? 'last'
									: 'middle'
					b.setAttribute('group', pos)
				})
			}
			apply()
			const mo = new MutationObserver(apply)
			mo.observe(el, { childList: true })
			return () => mo.disconnect()
		}, [props.side])

		const isEnd = props.side === 'end'
		const showAvatar = isEnd ? Boolean(props.showAvatar) : !props.hideAvatar

		return (
			<host shadowDom>
				<div class='row'>
					{showAvatar && (
						<div class='avatar'>
							<z-avatar
								size='small'
								name={props.avatarName || props.name}
								src={props.avatarSrc}
								initials={props.avatarInitials}
							/>
						</div>
					)}
					<div class='col'>
						{props.name && !isEnd && <div class='name'>{props.name}</div>}
						<slot />
						{props.timestamp && (
							<div class='meta'>
								<z-relative-time datetime={props.timestamp} />
							</div>
						)}
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			side: { type: String, reflect: true },
			name: { type: String, reflect: true },
			avatarSrc: { type: String, reflect: true },
			avatarName: { type: String, reflect: true },
			avatarInitials: { type: String, reflect: true },
			timestamp: { type: String, reflect: true },
			hideAvatar: { type: Boolean, reflect: true },
			showAvatar: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-message-group', ZMessageGroup)
