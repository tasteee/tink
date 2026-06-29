import { c, css, event, useProp } from 'atomico'

/*
 * z-pagination — numbered page navigation with prev/next arrows and ellipsis
 * truncation. Drive it with `page` (1-based) and `total` (page count); tune the
 * window with `siblingCount`. The current page reads in the accent; the rest
 * are hairline-bordered ghost buttons. Emits `change` with the new page.
 */
const styles = css`
	:host {
		display: inline-flex;
		--accent: var(--primary);
		user-select: none;
		-webkit-user-select: none;
	}

	:host([tone='primary']) {
		--accent: var(--purple);
	}

	:host([tone='secondary']) {
		--accent: var(--pink);
	}

	:host([is-hidden]) {
		display: none;
	}

	nav {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
	}

	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2.25rem;
		height: 2.25rem;
		padding: 0 0.5rem;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--foreground);
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: border-color 0.12s ease, background-color 0.12s ease, color 0.12s ease;
	}

	button:hover:not(:disabled):not(.is-current) {
		border-color: color-mix(in oklch, var(--foreground) 30%, transparent);
		color: var(--primary);
	}

	button.is-current {
		border-color: var(--accent);
		color: var(--accent);
		background: color-mix(in oklch, var(--accent) 12%, transparent);
		font-weight: 600;
		cursor: default;
	}

	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	button:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	.arrow svg {
		width: 1rem;
		height: 1rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.ellipsis {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2.25rem;
		height: 2.25rem;
		color: var(--muted-foreground);
		user-select: none;
	}
`

const range = (start: number, end: number): number[] => {
	const out: number[] = []
	for (let i = start; i <= end; i++) out.push(i)
	return out
}

// Build the page list with ellipsis markers (-1) given the current window.
const buildPages = (page: number, total: number, siblings: number): number[] => {
	const boundary = 1
	const totalNumbers = siblings * 2 + 3 + boundary * 2
	if (total <= totalNumbers) return range(1, total)

	const leftSibling = Math.max(page - siblings, boundary + 2)
	const rightSibling = Math.min(page + siblings, total - boundary - 1)

	const showLeftDots = leftSibling > boundary + 2
	const showRightDots = rightSibling < total - boundary - 1

	const pages: number[] = [1]
	if (showLeftDots) pages.push(-1)
	else pages.push(...range(2, leftSibling - 1))

	pages.push(...range(leftSibling, rightSibling))

	if (showRightDots) pages.push(-1)
	else pages.push(...range(rightSibling + 1, total - 1))

	pages.push(total)
	return pages
}

export const ZPagination = c(
	(props) => {
		const [page, setPage] = useProp<number>('page')
		const total = props.total ?? 1
		const current = Math.max(1, Math.min(page ?? 1, total))
		const siblings = props.siblingCount ?? 1

		const go = (next: number) => {
			if (next < 1 || next > total || next === current) return
			setPage(next)
			props.change({ page: next })
		}

		const pages = buildPages(current, total, siblings)

		return (
			<host shadowDom>
				<nav aria-label="Pagination">
					<button class="arrow" aria-label="Previous page" disabled={current <= 1} onclick={() => go(current - 1)}>
						<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
					</button>

					{pages.map((p, i) =>
						p === -1 ? (
							<span class="ellipsis" key={`e${i}`}>…</span>
						) : (
							<button
								key={p}
								class={p === current ? 'is-current' : ''}
								aria-current={p === current ? 'page' : undefined}
								onclick={() => go(p)}
							>
								{p}
							</button>
						)
					)}

					<button class="arrow" aria-label="Next page" disabled={current >= total} onclick={() => go(current + 1)}>
						<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
					</button>
				</nav>
			</host>
		)
	},
	{
		props: {
			page: { type: Number, reflect: true },
			total: { type: Number, reflect: true },
			siblingCount: { type: Number, reflect: true },
			tone: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ page: number }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-pagination', ZPagination)
