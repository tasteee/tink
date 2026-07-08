import { c, css, useEffect, useHost, useState } from 'atomico'

/*
 * z-pointer-follow — a custom cursor that trails the pointer. Two modes:
 *
 *  - scoped (default): wraps slotted content, tracks the pointer within its
 *    own bounding box, hides the native cursor only over that region. Same
 *    shape as z-tooltip/z-hover-card — self-contained, composable.
 *  - fixed: a page-level singleton with no children. Drop one
 *    `<z-pointer-follow fixed>` anywhere in the document; it listens on
 *    `window`, renders a `position: fixed` dot, and toggles `cursor: none`
 *    on `document.body` as a scoped side effect (cleaned up on disconnect) —
 *    the same pattern a modal uses for `overflow: hidden`. It does NOT wrap
 *    the page's content in shadow DOM; shadow encapsulation only covers this
 *    element's own dot/tag markup.
 */
const styles = css`
	:host {
		display: inline-block;
		position: relative;
		--tone: var(--purple);
	}

	:host([tone='secondary']) {
		--tone: var(--pink);
	}
	:host([tone='neutral']) {
		--tone: var(--color-neutral-6);
	}

	:host([is-hidden]) {
		display: none;
	}

	:host(:not([fixed])) {
		cursor: none;
	}

	:host([fixed]) {
		display: block;
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 9999;
	}

	.pointer {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		pointer-events: none;
		opacity: 0;
		will-change: transform;
		transition: opacity 0.15s ease;
	}

	.pointer.is-visible {
		opacity: 1;
	}

	.dot {
		width: 0.85rem;
		height: 0.85rem;
		border-radius: 999px;
		background: var(--tone);
		box-shadow: 0 0 0 3px color-mix(in oklch, var(--tone) 25%, transparent);
	}

	.tag {
		font-family: var(--font-sans);
		font-size: var(--font-size-caption);
		font-weight: 600;
		color: var(--primary-foreground);
		background: var(--tone);
		padding: 0.15rem 0.5rem;
		border-radius: var(--radius-sm);
		white-space: nowrap;
		transform: translateY(-0.1rem);
	}

	@media (prefers-reduced-motion: reduce) {
		.pointer {
			transition: none;
		}
	}
`

export const ZPointerFollow = c(
	(props) => {
		const host = useHost()
		const [pos, setPos] = useState({ x: 0, y: 0 })
		const [visible, setVisible] = useState(false)

		useEffect(() => {
			if (!props.fixed) return
			const handleMove = (nativeEvent: PointerEvent) => {
				setPos({ x: nativeEvent.clientX, y: nativeEvent.clientY })
				setVisible(true)
			}
			window.addEventListener('pointermove', handleMove)
			const prevCursor = document.body.style.cursor
			document.body.style.cursor = 'none'
			return () => {
				window.removeEventListener('pointermove', handleMove)
				document.body.style.cursor = prevCursor
				setVisible(false)
			}
		}, [props.fixed])

		const handleScopedMove = (nativeEvent: PointerEvent) => {
			const rect = (host.current as HTMLElement).getBoundingClientRect()
			setPos({ x: nativeEvent.clientX - rect.left, y: nativeEvent.clientY - rect.top })
			setVisible(true)
		}

		return (
			<host
				shadowDom
				onpointermove={props.fixed ? undefined : handleScopedMove}
				onpointerleave={props.fixed ? undefined : () => setVisible(false)}
			>
				{!props.fixed && <slot />}
				<div class={visible ? 'pointer is-visible' : 'pointer'} style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
					<span class="dot" aria-hidden="true"></span>
					{props.label && <span class="tag">{props.label}</span>}
				</div>
			</host>
		)
	},
	{
		props: {
			label: String,
			tone: { type: String, reflect: true },
			fixed: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-pointer-follow', ZPointerFollow)
