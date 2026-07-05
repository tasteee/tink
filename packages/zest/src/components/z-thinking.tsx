import { c, css } from 'atomico'

/*
 * z-thinking — a collapsible reasoning / chain-of-thought block. While
 * `is-active` the label shimmers (the model is still reasoning); when done, pass
 * a `duration` like "Thought for 4s". Composes z-collapsible for the disclosure.
 * Reasoning goes in the default slot, or pass `content` to render via z-markdown.
 *
 *   <z-thinking is-active label="Thinking">
 *     Let me work through the constraints…
 *   </z-thinking>
 */
const styles = css`
	:host {
		display: block;
	}
	:host([is-hidden]) {
		display: none;
	}
	z-collapsible {
		--accent: var(--muted-foreground);
	}
	.head {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--muted-foreground);
	}
	.spark {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--muted-foreground);
	}
	:host([is-active]) .spark {
		color: var(--primary);
	}
	.label {
		font-weight: 500;
	}
	:host([is-active]) .label {
		background: linear-gradient(
			90deg,
			var(--muted-foreground) 20%,
			var(--foreground) 50%,
			var(--muted-foreground) 80%
		);
		background-size: 200% 100%;
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: shimmer 1.6s linear infinite;
	}
	@keyframes shimmer {
		to {
			background-position: -200% 0;
		}
	}
	.dur {
		font-size: 0.8125rem;
		opacity: 0.75;
	}
	.body {
		color: var(--muted-foreground);
		font-size: 0.875rem;
		line-height: 1.55;
		white-space: pre-wrap;
	}
`

export const ZThinking = c(
	(props) => {
		return (
			<host shadowDom>
				<z-collapsible is-open={props.isExpanded}>
					<div slot="trigger" class="head">
						<svg class="spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" />
						</svg>
						<span class="label">{props.label || 'Thinking'}</span>
						{!props.isActive && props.duration && <span class="dur">{props.duration}</span>}
					</div>
					<div class="body">
						{props.content ? <z-markdown content={props.content} /> : <slot />}
					</div>
				</z-collapsible>
			</host>
		)
	},
	{
		props: {
			label: { type: String, reflect: true },
			duration: { type: String, reflect: true },
			content: { type: String },
			isActive: { type: Boolean, reflect: true },
			isExpanded: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-thinking', ZThinking)
