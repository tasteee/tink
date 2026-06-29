import { c, css, event } from 'atomico'

/*
 * z-breadcrumbs — a trail driven by an `items` array property:
 *   el.items = [{ label, href?, isCurrent? }]
 * Non-current items render as muted links that lift to the accent on hover; the
 * last (or any isCurrent) item is plain foreground text. A chevron separator
 * sits between crumbs. When an item has no href, clicking it fires `navigate`
 * with { value, index } so the host can route imperatively. Long trails can be
 * collapsed to a leading ellipsis with the `max` property.
 */
const styles = css`
	:host {
		display: block;
		--accent: var(--purple);
	}

	:host([tone='secondary']) {
		--accent: var(--pink);
	}

	:host([is-hidden]) {
		display: none;
	}

	ol {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: var(--font-size-small);
	}

	li {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.crumb {
		color: var(--muted-foreground);
		text-decoration: none;
		background: transparent;
		border: 0;
		padding: 0;
		font-family: inherit;
		font-size: inherit;
		cursor: pointer;
		transition: color 0.12s ease;
	}

	.crumb:hover {
		color: var(--accent);
	}

	.crumb:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.crumb.is-current {
		color: var(--foreground);
		font-weight: 500;
		cursor: default;
		pointer-events: none;
	}

	.ellipsis {
		color: var(--muted-foreground);
		user-select: none;
	}

	.sep {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
		color: var(--muted-foreground);
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}
`

type CrumbT = { label: string; href?: string; isCurrent?: boolean }

const Separator = () => (
	<svg class="sep" viewBox="0 0 24 24" aria-hidden="true">
		<polyline points="9 6 15 12 9 18" />
	</svg>
)

export const ZBreadcrumbs = c(
	(props) => {
		const all: CrumbT[] = Array.isArray(props.items) ? (props.items as CrumbT[]) : []
		const max = typeof props.max === 'number' && props.max > 0 ? props.max : 0

		// when collapsed, always keep the first crumb and the trailing (max - 1)
		const collapsed = max > 0 && all.length > max
		const visible: (CrumbT | null)[] = collapsed ? [all[0], null, ...all.slice(all.length - (max - 1))] : all

		const indexOf = (crumb: CrumbT) => all.indexOf(crumb)

		const renderCrumb = (crumb: CrumbT) => {
			const isCurrent = crumb.isCurrent || indexOf(crumb) === all.length - 1
			const cls = isCurrent ? 'crumb is-current' : 'crumb'
			if (crumb.href && !isCurrent) {
				return (
					<a class={cls} href={crumb.href} aria-current={isCurrent ? 'page' : undefined}>
						{crumb.label}
					</a>
				)
			}
			return (
				<button
					type="button"
					class={cls}
					aria-current={isCurrent ? 'page' : undefined}
					onclick={() => !isCurrent && props.navigate({ value: crumb.label, index: indexOf(crumb) })}
				>
					{crumb.label}
				</button>
			)
		}

		return (
			<host shadowDom>
				<ol>
					{visible.map((crumb, i) => (
						<li key={crumb ? crumb.label + i : 'ellipsis'}>
							{crumb ? renderCrumb(crumb) : <span class="ellipsis">…</span>}
							{i < visible.length - 1 && <Separator />}
						</li>
					))}
				</ol>
			</host>
		)
	},
	{
		props: {
			items: { type: Array },
			max: { type: Number },
			tone: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			navigate: event<{ value: string; index: number }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-breadcrumbs', ZBreadcrumbs)
