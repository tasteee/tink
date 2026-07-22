import { c, css, event, useHost, useEffect, useState } from 'atomico'
import { floatingIconButtonStyles } from '../shared/editor-overlay-styles'
import { AnyProp } from '../shared/overlay'
import { useVisibilityPhase } from '../shared/transition'

/*
 * Comment/annotation UI — three small elements that stay in sync through your
 * own decoration mapping (ProseMirror decorations, a CodeMirror mark, etc.),
 * never raw character offsets, since offsets shift under concurrent edits:
 *
 *  - z-comment-mark: wraps commented text inline (put it around the marked
 *    range in your rendered doc). Fires `activate` with { threadId } on click.
 *  - z-comment-gutter-icon: a teleporting singleton (same shape as
 *    z-gutter-handle) that shows a comment-count badge next to whichever line
 *    currently has one under the cursor/hover. Fires `open` with { threadId }.
 *  - z-comment-thread-panel: a docked right-side panel listing threads and
 *    their messages. Fires `select` { threadId }, `reply` { threadId, text },
 *    `resolve` { threadId }, `close`.
 */
const markStyles = css`
	:host {
		display: inline;
		background: color-mix(in oklch, var(--warning) 22%, transparent);
		border-bottom: 2px solid color-mix(in oklch, var(--warning) 55%, transparent);
		border-radius: 2px;
		cursor: pointer;
		transition: background-color 0.12s ease;
	}

	:host(:hover) {
		background: color-mix(in oklch, var(--warning) 32%, transparent);
	}

	:host([is-active]) {
		background: color-mix(in oklch, var(--purple) 26%, transparent);
		border-bottom-color: var(--purple);
	}

	:host([is-resolved]) {
		background: transparent;
		border-bottom-color: var(--border);
		opacity: 0.6;
	}
`

export const ZCommentMark = c(
	(props) => (
		<host shadowDom onclick={() => props.activate({ threadId: props.threadId || '' })}>
			<slot />
		</host>
	),
	{
		props: {
			threadId: { type: String, reflect: true },
			isActive: { type: Boolean, reflect: true },
			isResolved: { type: Boolean, reflect: true },
			activate: event<{ threadId: string }>({ bubbles: true, composed: true })
		},
		styles: markStyles
	}
)

customElements.define('z-comment-mark', ZCommentMark)

const gutterIconStyles = css`
	:host {
		position: fixed;
		left: 0;
		top: 0;
		z-index: var(--z-toolbar, 40);
		display: inline-flex;
		opacity: 0;
		transform: translateX(4px);
		pointer-events: none;
	}

	:host(.is-open) {
		opacity: 1;
		transform: translateX(0);
		transition:
			opacity 120ms ease-out,
			transform 120ms ease-out;
		pointer-events: auto;
	}

	:host(.is-closing) {
		opacity: 0;
		transform: translateX(0);
		transition: opacity 80ms ease-out;
		pointer-events: none;
	}

	.badge {
		position: absolute;
		top: -0.25rem;
		right: -0.25rem;
		min-width: 0.9rem;
		height: 0.9rem;
		padding: 0 0.2rem;
		border-radius: 999px;
		background: var(--warning);
		color: var(--bg);
		font-size: 0.6rem;
		font-weight: 700;
		line-height: 0.9rem;
		text-align: center;
	}

	.icon-button {
		position: relative;
	}
`

export const ZCommentGutterIcon = c(
	(props) => {
		const host = useHost()
		const isOpen = Boolean(props.isOpen)
		const phase = useVisibilityPhase(isOpen)
		const count = Number(props.count) || 0

		useEffect(() => {
			const el = host.current as HTMLElement
			if (!el || !props.anchorRect) return
			const rect = props.anchorRect as { x: number; y: number; width: number; height: number }
			el.style.left = `${rect.x}px`
			el.style.top = `${rect.y}px`
		}, [props.anchorRect])

		useEffect(() => {
			const el = host.current as HTMLElement
			el.classList.toggle('is-open', phase === 'open')
			el.classList.toggle('is-closing', phase === 'closing')
		}, [phase])

		return (
			<host shadowDom>
				<button
					type="button"
					class={['icon-button'].concat(props.isActive ? ['is-active'] : []).join(' ')}
					aria-label={count > 1 ? `${count} comments` : 'Comment'}
					onclick={() => props.open({ threadId: props.threadId || '' })}
				>
					<svg viewBox="0 0 24 24">
						<path d="M21 11.5a8.38 8.38 0 0 1-8.8 8.4 8.5 8.5 0 0 1-4-1L3 20l1.3-3.9a8.38 8.38 0 0 1-1-4A8.5 8.5 0 0 1 12 3.6a8.38 8.38 0 0 1 9 7.9Z" />
					</svg>
					{count > 0 && <span class="badge">{count}</span>}
				</button>
			</host>
		)
	},
	{
		props: {
			threadId: { type: String, reflect: true },
			anchorRect: AnyProp,
			count: { type: Number },
			isActive: { type: Boolean, reflect: true },
			isOpen: { type: Boolean, reflect: true },
			open: event<{ threadId: string }>({ bubbles: true, composed: true })
		},
		styles: [floatingIconButtonStyles, gutterIconStyles]
	}
)

customElements.define('z-comment-gutter-icon', ZCommentGutterIcon)

type CommentMessageT = { author?: string; text?: string; time?: string }
type CommentThreadT = { id: string; messages?: CommentMessageT[]; isResolved?: boolean }

const panelStyles = css`
	:host {
		display: flex;
		flex-direction: column;
		width: 20rem;
		max-width: 100%;
		box-sizing: border-box;
		height: 100%;
		background: var(--popover);
		border-left: 1px solid var(--border);
	}

	:host([is-hidden]) {
		display: none;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--border);
		font-size: var(--font-size-small);
		font-weight: 600;
		color: var(--foreground);
	}

	.list {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.thread {
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.625rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		cursor: pointer;
	}

	.thread.is-active {
		border-color: var(--purple);
	}

	.thread.is-resolved {
		opacity: 0.55;
	}

	.message {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.message .meta {
		display: flex;
		gap: 0.375rem;
		font-size: var(--font-size-caption);
		color: var(--muted-foreground);
	}

	.message .text {
		font-size: var(--font-size-small);
		color: var(--foreground);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.reply {
		flex: 1;
		resize: none;
		min-height: 2rem;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 0.375rem 0.5rem;
		color: var(--foreground);
		font-family: inherit;
		font-size: var(--font-size-small);
	}

	.resolve {
		flex-shrink: 0;
		height: 1.75rem;
		padding: 0 0.625rem;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--foreground);
		font-family: inherit;
		font-size: var(--font-size-caption);
		cursor: pointer;
	}

	.close {
		background: transparent;
		border: 0;
		color: var(--muted-foreground);
		cursor: pointer;
	}
`

export const ZCommentThreadPanel = c(
	(props) => {
		const [draft, setDraft] = useState('')
		const threads: CommentThreadT[] = Array.isArray(props.threads) ? (props.threads as CommentThreadT[]) : []

		const submitReply = (threadId: string) => {
			if (!draft.trim()) return
			props.reply({ threadId, text: draft })
			setDraft('')
		}

		return (
			<host shadowDom role="complementary" aria-label="Comments">
				<div class="header">
					<span>Comments</span>
					<button type="button" class="close" aria-label="Close comments" onclick={() => props.close()}>
						✕
					</button>
				</div>
				<div class="list">
					{threads.map((thread) => {
						const threadClass = ['thread']
							.concat(thread.id === props.activeThreadId ? ['is-active'] : [])
							.concat(thread.isResolved ? ['is-resolved'] : [])
							.join(' ')
						const messages: CommentMessageT[] = Array.isArray(thread.messages) ? thread.messages : []
						return (
							<div key={thread.id} class={threadClass} onclick={() => props.select({ threadId: thread.id })}>
								{messages.map((message, index) => (
									<div key={index} class="message">
										<div class="meta">
											<span>{message.author || 'Anonymous'}</span>
											<span>{message.time || ''}</span>
										</div>
										<div class="text">{message.text}</div>
									</div>
								))}
								{thread.id === props.activeThreadId && !thread.isResolved && (
									<div class="actions" onclick={(clickEvent: MouseEvent) => clickEvent.stopPropagation()}>
										<textarea
											class="reply"
											placeholder="Reply…"
											value={draft}
											oninput={(inputEvent: any) => setDraft(inputEvent.target.value)}
										/>
										<button type="button" class="resolve" onclick={() => submitReply(thread.id)}>
											Reply
										</button>
										<button type="button" class="resolve" onclick={() => props.resolve({ threadId: thread.id })}>
											Resolve
										</button>
									</div>
								)}
							</div>
						)
					})}
				</div>
			</host>
		)
	},
	{
		props: {
			threads: { type: Array },
			activeThreadId: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			select: event<{ threadId: string }>({ bubbles: true, composed: true }),
			reply: event<{ threadId: string; text: string }>({ bubbles: true, composed: true }),
			resolve: event<{ threadId: string }>({ bubbles: true, composed: true }),
			close: event<void>({ bubbles: true, composed: true })
		},
		styles: panelStyles
	}
)

customElements.define('z-comment-thread-panel', ZCommentThreadPanel)
