import { c, css, useState, useEffect, useRef } from 'atomico'

/*
 * z-streaming-text — reveals assistant text with a trailing cursor. Two modes:
 *
 *   - Live streaming: append tokens to `content` and set `is-streaming`; the
 *     text shows as-is with a blinking cursor until you clear the flag.
 *   - Typewriter: set `typewriter` and it reveals `content` progressively at
 *     `speed` (chars/sec), cursor on until it catches up.
 *
 * Set `markdown` to render the revealed text through z-markdown (GFM, code
 * blocks); otherwise it renders as plain text. Feeds z-message-text in AI chat.
 */
const styles = css`
	:host {
		display: inline;
		color: inherit;
	}
	:host([is-hidden]) {
		display: none;
	}
	.text {
		white-space: pre-wrap;
	}
	.cursor {
		display: inline-block;
		width: 0.55em;
		height: 1.05em;
		margin-left: 1px;
		transform: translateY(0.15em);
		background: currentColor;
		border-radius: 1px;
		animation: blink 1s steps(2, start) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
`

export const ZStreamingText = c(
	(props) => {
		const content = (props.content as string) ?? ''
		const [shown, setShown] = useState(0)
		const shownRef = useRef(0)
		shownRef.current = shown

		useEffect(() => {
			if (!props.typewriter) {
				setShown(content.length)
				return
			}
			// Time-based reveal: derive `shown` from elapsed·speed rather than a fixed
			// increment per tick, so throttled/dropped ticks (background tabs, jank)
			// self-correct instead of falling behind. `base` lets streaming appends
			// continue from where the reveal already is.
			const speed = (props.speed as number) || 40
			const start = performance.now()
			const base = shownRef.current ?? 0
			const id = setInterval(() => {
				const target = base + Math.floor(((performance.now() - start) / 1000) * speed)
				const next = Math.min(content.length, target)
				setShown(next)
				if (next >= content.length) clearInterval(id)
			}, 30)
			return () => clearInterval(id)
		}, [content, props.typewriter, props.speed])

		const revealed = props.typewriter ? content.slice(0, Math.min(shown, content.length)) : content
		const revealing = props.typewriter && shown < content.length
		const showCursor = props.isStreaming || revealing

		return (
			<host shadowDom>
				{props.markdown ? (
					<z-markdown content={revealed} is-streaming={showCursor} />
				) : (
					<span class="text">{revealed}</span>
				)}
				{showCursor && <span class="cursor" aria-hidden="true"></span>}
			</host>
		)
	},
	{
		props: {
			content: { type: String },
			isStreaming: { type: Boolean, reflect: true },
			typewriter: { type: Boolean, reflect: true },
			markdown: { type: Boolean, reflect: true },
			speed: { type: Number, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-streaming-text', ZStreamingText)
