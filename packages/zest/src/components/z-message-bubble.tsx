import { c, css } from 'atomico'

/*
 * z-message-bubble — a single chat bubble. Purely visual; the surrounding
 * z-message-group sets its `side` (start = them, end = you) and `group`
 * position (single/first/middle/last) so consecutive bubbles from one sender
 * share tucked corners, iMessage/Messenger style.
 *
 *   <z-message-bubble>Hey! How's it going?</z-message-bubble>
 *
 * Content is slotted, so a bubble can hold plain text, a z-markdown, an image,
 * or any other z-* payload.
 */
const styles = css`
	:host {
		display: block;
		--r: 1.125rem;
		--tight: 0.3rem;
	}
	:host([is-hidden]) {
		display: none;
	}

	.bubble {
		display: inline-block;
		max-width: 100%;
		box-sizing: border-box;
		padding: 0.5rem 0.75rem;
		font-size: 0.9375rem;
		line-height: 1.4;
		border-radius: var(--r);
		overflow-wrap: anywhere;
		white-space: pre-wrap;
		/* theirs (default / start) */
		background: color-mix(in oklch, var(--foreground) 8%, var(--card));
		color: var(--foreground);
	}

	:host([side='end']) .bubble {
		background: var(--primary);
		color: var(--primary-foreground);
	}

	/* grouped corners — tuck the corners on the sender's near side */
	:host([side='start'][group='first']) .bubble {
		border-bottom-left-radius: var(--tight);
	}
	:host([side='start'][group='middle']) .bubble {
		border-top-left-radius: var(--tight);
		border-bottom-left-radius: var(--tight);
	}
	:host([side='start'][group='last']) .bubble {
		border-top-left-radius: var(--tight);
	}
	:host([side='end'][group='first']) .bubble {
		border-bottom-right-radius: var(--tight);
	}
	:host([side='end'][group='middle']) .bubble {
		border-top-right-radius: var(--tight);
		border-bottom-right-radius: var(--tight);
	}
	:host([side='end'][group='last']) .bubble {
		border-top-right-radius: var(--tight);
	}

	::slotted(img),
	::slotted(video) {
		display: block;
		max-width: 100%;
		border-radius: calc(var(--r) - 0.25rem);
	}
`

export const ZMessageBubble = c(
	(props) => {
		return (
			<host shadowDom>
				<div class='bubble' part='bubble'>
					<slot />
				</div>
			</host>
		)
	},
	{
		props: {
			side: { type: String, reflect: true },
			group: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-message-bubble', ZMessageBubble)
