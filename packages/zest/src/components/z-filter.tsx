import { c, css, event, useState } from 'atomico'

/*
 * z-filter — a pill-based faceting control (the daisyUI "filter" UX). Options
 * are supplied as an `options` array property:
 *   el.options = [{ value, label, isDisabled?, children? }]
 *
 * Flat (default): a single-select group. Picking a pill collapses the rest
 * away and reveals a reset (✕); reset brings them all back.
 *
 * Nested (`is-drilldown`): options may carry `children`. Picking a branch
 * *drills in* — its siblings collapse into a breadcrumb crumb and its children
 * appear as the next level of muted "candidate" pills. Picking a leaf just
 * activates it; its siblings stay visible (only not active). Crumbs are
 * clickable to step back up; the ✕ clears everything.
 *
 * The difference between the two modes is a single rule: a *leaf* selection
 * collapses its level in flat mode, and keeps it in drill-down mode. Drilling
 * through a *branch* always collapses. Emits `change` with { value, path }.
 */
const styles = css`
	:host {
		display: block;
		--filter-accent: var(--primary);
	}

	:host([tone='primary']) {
		--filter-accent: var(--purple);
	}
	:host([tone='secondary']) {
		--filter-accent: var(--pink);
	}

	:host([is-hidden]) {
		display: none;
	}

	.filter {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-family: inherit;
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: transparent;
		/* resting / candidate: the less-prominent neutral state */
		color: var(--muted-foreground);
		cursor: pointer;
		transition:
			background-color 0.12s ease,
			border-color 0.12s ease,
			color 0.12s ease,
			opacity 0.12s ease;
	}

	.filter.is-small .pill {
		font-size: 0.75rem;
		padding: 0.3125rem 0.6875rem;
	}
	.filter.is-medium .pill {
		font-size: 0.8125rem;
		padding: 0.4375rem 0.875rem;
	}

	.pill:hover {
		border-color: color-mix(in srgb, var(--filter-accent) 45%, var(--border));
		color: var(--foreground);
	}

	/* chosen — a crumb (drilled ancestor) or the active frontier leaf. Wins over
	   the muted resting look with an accent tint + border. */
	.pill.is-active,
	.pill.is-crumb {
		background: color-mix(in oklch, var(--filter-accent) 14%, transparent);
		border-color: color-mix(in oklch, var(--filter-accent) 50%, transparent);
		color: var(--filter-accent);
		font-weight: 600;
	}
	/* neutral accent === foreground, which reads fine as text on the faint tint */
	:host(:not([tone])) .pill.is-active,
	:host(:not([tone])) .pill.is-crumb,
	:host([tone='neutral']) .pill.is-active,
	:host([tone='neutral']) .pill.is-crumb {
		color: var(--foreground);
	}

	.pill.is-disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	.pill:focus-visible,
	.reset:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	/* reset ✕ */
	.reset {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: transparent;
		color: var(--muted-foreground);
		cursor: pointer;
		padding: 0;
		transition:
			border-color 0.12s ease,
			color 0.12s ease;
	}
	.filter.is-small .reset {
		width: 1.625rem;
		height: 1.625rem;
	}
	.filter.is-medium .reset {
		width: 1.875rem;
		height: 1.875rem;
	}
	.reset:hover {
		border-color: color-mix(in srgb, var(--destructive) 50%, var(--border));
		color: var(--destructive);
	}
	.reset svg {
		width: 0.7rem;
		height: 0.7rem;
		stroke: currentColor;
		stroke-width: 2.5;
		stroke-linecap: round;
		fill: none;
	}

	/* › between the crumb trail and the current frontier */
	.sep {
		display: inline-flex;
		align-items: center;
		color: var(--muted-foreground);
		opacity: 0.5;
	}
	.sep svg {
		width: 0.85rem;
		height: 0.85rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}
`

type FilterOptionT = {
	value: string
	label: string
	isDisabled?: boolean
	children?: FilterOptionT[]
}

type CrumbT = { node: FilterOptionT; level: number }

type ViewT = {
	crumbs: CrumbT[]
	frontier: FilterOptionT[]
	frontierParent: string[]
	frontierChosen?: string
}

const hasChildren = (n?: FilterOptionT): boolean => !!(n && n.children && n.children.length)

/*
 * Walk the chosen `path` down the tree, then decide what to show:
 *   - nothing chosen        → frontier = the root options
 *   - chosen node branches  → collapse the whole path to crumbs, frontier = its children
 *   - chosen node is a leaf → collapseLeaf ? crumbs only (flat/daisyUI collapse)
 *                                          : keep its siblings as the frontier (drill-down)
 */
const resolveView = (options: FilterOptionT[], path: string[], collapseLeaf: boolean): ViewT => {
	const levels: FilterOptionT[][] = [options]
	const chosen: FilterOptionT[] = []
	let current = options

	for (const value of path) {
		const node = current.find((n) => n.value === value)
		if (!node) break
		chosen.push(node)
		current = node.children || []
		levels.push(current)
	}

	if (chosen.length === 0) {
		return { crumbs: [], frontier: options, frontierParent: [] }
	}

	const last = chosen[chosen.length - 1]
	const chosenPath = chosen.map((n) => n.value)
	const asCrumbs = (nodes: FilterOptionT[]): CrumbT[] => nodes.map((node, level) => ({ node, level }))

	if (hasChildren(last)) {
		return { crumbs: asCrumbs(chosen), frontier: last.children as FilterOptionT[], frontierParent: chosenPath }
	}

	if (collapseLeaf) {
		return { crumbs: asCrumbs(chosen), frontier: [], frontierParent: chosenPath }
	}

	// drill-down leaf: keep the level `last` belongs to visible, `last` active
	return {
		crumbs: asCrumbs(chosen.slice(0, -1)),
		frontier: levels[chosen.length - 1],
		frontierParent: chosenPath.slice(0, -1),
		frontierChosen: last.value
	}
}

export const ZFilter = c(
	(props) => {
		const [path, setPath] = useState<string[]>([])

		const options: FilterOptionT[] = Array.isArray(props.options) ? (props.options as FilterOptionT[]) : []
		const collapseLeaf = !props.isDrilldown
		const view = resolveView(options, path, collapseLeaf)

		const apply = (next: string[]) => {
			setPath(next)
			props.change({ value: next.length ? next[next.length - 1] : undefined, path: next })
		}

		const selectFrontier = (node: FilterOptionT) => {
			if (node.isDisabled) return
			apply([...view.frontierParent, node.value])
		}

		const filterClass = ['filter', props.size === 'small' ? 'is-small' : 'is-medium'].join(' ')

		return (
			<host shadowDom role="group" aria-label={props.label}>
				<div class={filterClass}>
					{path.length > 0 && (
						<button type="button" class="reset" aria-label={props.resetLabel || 'Clear'} onclick={() => apply([])}>
							<svg viewBox="0 0 12 12">
								<path d="M3 3l6 6M9 3l-6 6" />
							</svg>
						</button>
					)}

					{view.crumbs.map((crumb) => (
						<button
							type="button"
							key={`crumb-${crumb.level}`}
							class="pill is-crumb"
							onclick={() => apply(path.slice(0, crumb.level + 1))}
						>
							{crumb.node.label}
						</button>
					))}

					{view.crumbs.length > 0 && view.frontier.length > 0 && (
						<span class="sep" aria-hidden="true">
							<svg viewBox="0 0 24 24">
								<polyline points="9 6 15 12 9 18" />
							</svg>
						</span>
					)}

					{view.frontier.map((node) => {
						const isActive = node.value === view.frontierChosen
						const pillClass = ['pill']
							.concat(isActive ? ['is-active'] : [])
							.concat(node.isDisabled ? ['is-disabled'] : [])
							.join(' ')
						return (
							<button
								type="button"
								key={node.value}
								class={pillClass}
								aria-pressed={isActive ? 'true' : 'false'}
								onclick={() => selectFrontier(node)}
							>
								{node.label}
							</button>
						)
					})}
				</div>
			</host>
		)
	},
	{
		props: {
			options: { type: Array },
			tone: { type: String, reflect: true },
			size: { type: String, reflect: true },
			label: String,
			resetLabel: String,
			isDrilldown: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ value?: string; path: string[] }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-filter', ZFilter)
