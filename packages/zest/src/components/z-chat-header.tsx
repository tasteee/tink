import { c, css } from 'atomico'

/*
 * z-chat-header — the thread's top bar: avatar, name, a presence/subtitle line,
 * and a trailing `actions` slot (call / video / info buttons). Composes z-avatar.
 *
 *   <z-chat-header name="Alice Rivera" subtitle="Active now" status="online">
 *     <z-button slot="actions" kind="ghost">Call</z-button>
 *   </z-chat-header>
 */
const styles = css`
	:host {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 1rem;
		border-bottom: 1px solid var(--border);
		background: var(--card);
	}
	:host([is-hidden]) {
		display: none;
	}
	.who {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	.name {
		font-weight: 600;
		font-size: 0.9375rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.subtitle {
		font-size: 0.75rem;
		color: var(--muted-foreground);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.actions {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}
`

export const ZChatHeader = c(
	(props) => (
		<host shadowDom>
			<z-avatar name={props.avatarName || props.name} src={props.avatarSrc} status={props.status} />
			<div class="who">
				<span class="name">{props.name}<slot name="name" /></span>
				{(props.subtitle || props.status) && (
					<span class="subtitle">{props.subtitle}<slot name="subtitle" /></span>
				)}
			</div>
			<div class="actions">
				<slot name="actions" />
			</div>
		</host>
	),
	{
		props: {
			name: { type: String, reflect: true },
			subtitle: { type: String, reflect: true },
			avatarSrc: { type: String, reflect: true },
			avatarName: { type: String, reflect: true },
			status: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-chat-header', ZChatHeader)
