import { c, css, event } from 'atomico'

/*
 * z-quoted-message — the "replying to…" snippet: an accent bar, the original
 * sender, and a truncated preview of the quoted text. Use it inside a
 * z-message-bubble (a reply) or in the composer's context bar while composing
 * one. Clicking emits `jump` {value} to scroll to the original.
 *
 *   <z-quoted-message name="Alice" text="Did you see the designs?"></z-quoted-message>
 */
const styles = css`
	:host {
		display: block;
		--bar: var(--primary);
	}
	:host([tone='secondary']) {
		--bar: var(--pink);
	}
	:host([is-hidden]) {
		display: none;
	}
	.quote {
		display: flex;
		gap: 0.5rem;
		align-items: stretch;
		width: 100%;
		box-sizing: border-box;
		text-align: left;
		background: color-mix(in oklch, var(--foreground) 5%, transparent);
		border: none;
		border-radius: var(--radius-sm);
		padding: 0.375rem 0.5rem;
		font-family: inherit;
		color: inherit;
		cursor: pointer;
	}
	.quote:disabled {
		cursor: default;
	}
	.bar {
		flex: 0 0 3px;
		border-radius: 999px;
		background: var(--bar);
	}
	.body {
		min-width: 0;
	}
	.name {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--bar);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.text {
		font-size: 0.8125rem;
		color: var(--muted-foreground);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
`

export const ZQuotedMessage = c(
	(props) => (
		<host shadowDom>
			<button
				class="quote"
				type="button"
				disabled={props.noJump}
				onclick={() => !props.noJump && props.jump({ value: props.value })}
			>
				<span class="bar" aria-hidden="true"></span>
				<span class="body">
					{props.name && <span class="name">{props.name}</span>}
					<span class="text">{props.text}<slot /></span>
				</span>
			</button>
		</host>
	),
	{
		props: {
			name: { type: String, reflect: true },
			text: { type: String, reflect: true },
			value: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			noJump: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			jump: event<{ value?: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-quoted-message', ZQuotedMessage)
