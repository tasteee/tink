import { c, css, event } from 'atomico'

/*
 * z-send-button — the circular send control for a composer. Two states: idle
 * (send arrow, emits `send`) and streaming (stop square, emits `stop`). The
 * composer wires its default trailing button to this; AI chat flips
 * `is-streaming` while a response is generating so the same button becomes stop.
 *
 *   <z-send-button></z-send-button>
 *   <z-send-button is-streaming></z-send-button>
 */
const styles = css`
	:host {
		display: inline-flex;
	}
	:host([is-hidden]) {
		display: none;
	}
	button {
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 999px;
		border: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		background: var(--primary);
		color: var(--primary-foreground);
		padding: 0;
		transition:
			opacity 0.12s ease,
			transform 0.08s ease,
			background-color 0.12s ease;
	}
	button:hover:not(:disabled) {
		transform: scale(1.05);
	}
	button:active:not(:disabled) {
		transform: scale(0.95);
	}
	button:disabled {
		opacity: 0.4;
		cursor: default;
	}
	:host([is-streaming]) button {
		background: var(--destructive);
	}
	svg {
		width: 1.1rem;
		height: 1.1rem;
		stroke: currentColor;
		fill: none;
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.stop {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 3px;
		background: currentColor;
	}
`

export const ZSendButton = c(
	(props) => {
		const onClick = () => {
			if (props.isStreaming) props.stop()
			else if (!props.isDisabled) props.send()
		}

		return (
			<host shadowDom>
				<button
					type='button'
					disabled={props.isDisabled && !props.isStreaming}
					aria-label={props.isStreaming ? 'Stop' : props.label || 'Send'}
					onclick={onClick}
				>
					{props.isStreaming ? (
						<span class='stop' aria-hidden='true'></span>
					) : (
						<svg viewBox='0 0 24 24' aria-hidden='true'>
							<path d='M12 19V5M5 12l7-7 7 7' />
						</svg>
					)}
				</button>
			</host>
		)
	},
	{
		props: {
			isStreaming: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			label: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			send: event<void>({ bubbles: true, composed: true }),
			stop: event<void>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-send-button', ZSendButton)
