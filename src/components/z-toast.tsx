import { c, css, event, useRef, useState, useEffect, useHost } from 'atomico'

/*
 * z-toast — a toaster region that stacks transient notifications. Place one on
 * the page, then push toasts imperatively:
 *   const t = document.querySelector('z-toast')
 *   t.push({ title: 'Saved', description: '…', tone: 'success', duration: 4000 })
 *   t.dismiss(id)            // or let them auto-expire (duration: 0 = sticky)
 * `position` parks the stack in a corner. Each toast carries a tone accent and a
 * close button. Fires `dismiss` with { id } when one leaves.
 */
const styles = css`
	:host {
		position: fixed;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
		width: min(22rem, calc(100vw - 2rem));
		pointer-events: none;
	}

	:host(:not([position])),
	:host([position='bottom-end']) {
		bottom: 1.25rem;
		right: 1.25rem;
	}
	:host([position='bottom-start']) {
		bottom: 1.25rem;
		left: 1.25rem;
	}
	:host([position='bottom-center']) {
		bottom: 1.25rem;
		left: 50%;
		transform: translateX(-50%);
	}
	:host([position='top-end']) {
		top: 1.25rem;
		right: 1.25rem;
	}
	:host([position='top-start']) {
		top: 1.25rem;
		left: 1.25rem;
	}
	:host([position='top-center']) {
		top: 1.25rem;
		left: 50%;
		transform: translateX(-50%);
	}

	.toast {
		pointer-events: auto;
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		box-sizing: border-box;
		padding: 0.75rem 0.875rem;
		background: var(--popover);
		border: 1px solid var(--border);
		border-left: 3px solid var(--toast-accent, var(--border));
		border-radius: var(--radius-md);
		animation: toast-in 0.18s ease;
	}

	.toast.is-info {
		--toast-accent: var(--purple);
	}
	.toast.is-success {
		--toast-accent: var(--success);
	}
	.toast.is-warning {
		--toast-accent: var(--warning);
	}
	.toast.is-danger {
		--toast-accent: var(--destructive);
	}

	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.title {
		font-size: var(--font-size-small);
		font-weight: 600;
		color: var(--foreground);
		line-height: 1.4;
	}

	.description {
		font-size: var(--font-size-caption);
		color: var(--muted-foreground);
		line-height: var(--line-height-body);
	}

	.close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		margin: -0.125rem -0.25rem 0 0;
		background: transparent;
		border: 0;
		border-radius: var(--radius-sm);
		color: var(--muted-foreground);
		cursor: pointer;
		transition: color 0.12s ease;
	}

	.close:hover {
		color: var(--foreground);
	}

	.close svg {
		width: 0.875rem;
		height: 0.875rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		fill: none;
	}
`

type ToastT = { id: number; tone?: string; title?: string; description?: string }
type ToastInput = { tone?: string; title?: string; description?: string; duration?: number }

export const ZToast = c(
	(props) => {
		const host = useHost()
		const [toasts, setToasts] = useState<ToastT[]>([])
		const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())
		const idRef = useRef(0)

		const dismiss = (id: number) => {
			setToasts((prev) => prev.filter((t) => t.id !== id))
			const map = timers.current!
			const timer = map.get(id)
			if (timer) {
				clearTimeout(timer)
				map.delete(id)
			}
			props.dismiss({ id })
		}

		useEffect(() => {
			const el = host.current as any
			el.push = (input: ToastInput = {}) => {
				const id = (idRef.current ?? 0) + 1
				idRef.current = id
				setToasts((prev) => [...prev, { id, tone: input.tone, title: input.title, description: input.description }])
				const duration = input.duration ?? 4000
				if (duration > 0) timers.current!.set(id, setTimeout(() => dismiss(id), duration))
				return id
			}
			el.dismiss = (id: number) => dismiss(id)
			const captured = timers.current!
			return () => {
				captured.forEach((t) => clearTimeout(t))
				captured.clear()
			}
		}, [])

		return (
			<host shadowDom role="region" aria-label="Notifications">
				{toasts.map((toast) => (
					<div key={toast.id} class={`toast is-${toast.tone || 'neutral'}`} role="status">
						<div class="content">
							{toast.title && <span class="title">{toast.title}</span>}
							{toast.description && <span class="description">{toast.description}</span>}
						</div>
						<button type="button" class="close" aria-label="Dismiss" onclick={() => dismiss(toast.id)}>
							<svg viewBox="0 0 24 24">
								<line x1="6" y1="6" x2="18" y2="18" />
								<line x1="18" y1="6" x2="6" y2="18" />
							</svg>
						</button>
					</div>
				))}
			</host>
		)
	},
	{
		props: {
			position: { type: String, reflect: true },
			dismiss: event<{ id: number }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-toast', ZToast)
