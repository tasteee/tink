import { c, css, event, useHost, useEffect } from 'atomico'

/*
 * z-message-list — the scroll surface for a conversation. Slotted, declarative
 * (author z-message-group / z-date-divider children directly). Its job is the
 * behavior every chat needs: pin-to-bottom. When the user is already near the
 * bottom and a new message arrives, it stays pinned; when they've scrolled up to
 * read history, new messages don't yank them down.
 *
 *   <z-message-list>
 *     <z-date-divider label="Today"></z-date-divider>
 *     <z-message-group side="start" name="Alice">…</z-message-group>
 *   </z-message-list>
 *
 * Methods: scrollToBottom() · isAtBottom(). Reflects `is-pinned`. Emits
 * `pinnedchange` {isPinned} when the pinned state flips. For very long histories
 * this can later hand rows to z-virtual-list; the pin-to-bottom contract is the
 * same either way.
 */
const styles = css`
	:host {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		overflow-y: auto;
		padding: var(--space-md);
		position: relative;
	}
	:host([is-hidden]) {
		display: none;
	}
`

export const ZMessageList = c(
	(props) => {
		const host = useHost()

		useEffect(() => {
			const el = host.current as HTMLElement
			const threshold = (props.pinThreshold as number) || 80
			let pinned = true

			const distanceFromBottom = () => el.scrollHeight - el.scrollTop - el.clientHeight
			const atBottom = () => distanceFromBottom() < threshold
			const scrollToBottom = (behavior: ScrollBehavior = 'auto') =>
				el.scrollTo({ top: el.scrollHeight, behavior })

			const setPinned = (next: boolean) => {
				if (next === pinned) return
				pinned = next
				el.toggleAttribute('is-pinned', next)
				props.pinnedchange({ isPinned: next })
			}

			const onScroll = () => setPinned(atBottom())

			// New content: keep us glued to the bottom only if we were already there.
			const mo = new MutationObserver(() => {
				if (pinned) scrollToBottom()
			})
			mo.observe(el, { childList: true, subtree: true })
			el.addEventListener('scroll', onScroll, { passive: true })

			// imperative API
			const api = el as any
			api.scrollToBottom = scrollToBottom
			api.isAtBottom = atBottom

			// start pinned to the latest message
			el.toggleAttribute('is-pinned', true)
			requestAnimationFrame(() => scrollToBottom())

			return () => {
				mo.disconnect()
				el.removeEventListener('scroll', onScroll)
			}
		}, [props.pinThreshold])

		return (
			<host shadowDom>
				<slot />
			</host>
		)
	},
	{
		props: {
			pinThreshold: { type: Number, reflect: true },
			isPinned: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			pinnedchange: event<{ isPinned: boolean }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-message-list', ZMessageList)
