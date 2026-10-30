import { c, css, event, useState, useEffect, useHost } from 'atomico'
import { themedScrollbarStyles } from '../shared/scrollbar-styles'

/*
 * z-sidebar, a vertical navigation rail driven by an `items` array property.
 * Entries are either links or groups:
 *   el.items = [
 *     { value, label, icon?, badge? },                     // top-level link
 *     { label: 'Workspace', items: [ { value, label, icon? } ] }  // group
 *   ]
 * Groups may nest one level (a group's items can include sub-groups, shown as
 * quieter sub-headings). Items render in the order given, and a group's label
 * doubles as a disclosure trigger, clicking it collapses/expands that group
 * (open by default). The entry whose value matches the `value` property is
 * marked active with an accent tint and rule. A `header` slot and `footer`
 * slot bracket the nav, put a logo up top, a settings/account row at the
 * bottom, so this can double as a full site nav bar; their reserved
 * padding/border only appears once something is actually slotted in. Only
 * the nav in between scrolls (header/footer stay put) provided the host
 * itself has a bounded height (e.g. height: 100% inside a fixed-height
 * ancestor). `is-collapsed` shrinks it to an icon rail. `is-docked` strips
 * the card look (background, border, radius, inline padding) down to a
 * flush rail with a hairline trailing border, for docking flush against a
 * page edge instead of sitting inset as a panel. Fires `select` with
 * { value }.
 */
const styles = css`
	:host {
		display: flex;
		flex-direction: column;
		width: var(--z-sidebar-width, 16rem);
		box-sizing: border-box;
		/* fills a parent with a definite height (app shells), falls back to its
		   natural content height inline; min-height: 0 lets it shrink and scroll
		   its nav inside flex/grid parents. */
		height: 100%;
		min-height: 0;
		max-height: 100%;
		background: var(--color-neutral-0);
		border: 1px solid var(--sidebar-border);
		border-radius: var(--radius-lg);
		padding: var(--space-sm) var(--space-md) var(--space-md);
		color: var(--sidebar-foreground);
		--accent: var(--purple);
		transition: width var(--motion-fast) var(--ease-enter);
		user-select: none;
		-webkit-user-select: none;
	}

	:host([tone='secondary']) {
		--accent: var(--pink);
	}

	:host([is-collapsed]) {
		width: var(--z-sidebar-collapsed-width, 4rem);
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([is-docked]) {
		background: transparent;
		border: none;
		border-right: 1px solid var(--sidebar-border);
		border-radius: 0;
		padding: var(--space-sm) 0 var(--space-md);
	}

	.head.has-content {
		padding: 0.25rem 0.5rem 0.75rem;
	}

	.foot.has-content {
		margin-top: auto;
		padding-top: 0.75rem;
		border-top: 1px solid var(--sidebar-border);
	}

	nav {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-height: 0;
		gap: 0.125rem;
		overflow-y: auto;
	}

	/* Firefox has no ::-webkit-scrollbar and never draws arrows, give it the
	   standard thin themed bar. Chromium must NOT get scrollbar-width: with it set,
	   Chrome falls back to the OS scrollbar (stepper arrows on Windows) and ignores
	   the custom rules below. */
	@supports not selector(::-webkit-scrollbar) {
		nav {
			scrollbar-width: thin;
			scrollbar-color: var(--color-neutral-3) transparent;
		}
	}

	/* WebKit / Chromium, slim, track-less, arrow-less */
	nav::-webkit-scrollbar {
		width: 6px;
	}
	nav::-webkit-scrollbar-track {
		background: transparent;
	}
	nav::-webkit-scrollbar-thumb {
		background: var(--color-neutral-3);
		border-radius: 999px;
	}
	nav::-webkit-scrollbar-thumb:hover {
		background: var(--color-neutral-4);
	}
	/* No stepper arrows: Windows Chromium renders them otherwise. */
	nav::-webkit-scrollbar-button {
		display: none;
		width: 0;
		height: 0;
	}

	.group-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		width: 100%;
		box-sizing: border-box;
		padding: 0.375rem 0.625rem 0.875rem;
		font-family: inherit;
		font-size: var(--font-size-caption);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: color-mix(in oklch, var(--muted-foreground) 70%, transparent);
		background: transparent;
		border: 0;
		text-align: left;
		cursor: pointer;
		white-space: nowrap;
		overflow: hidden;
		transition: color var(--motion-fast) var(--ease-enter);
	}

	.group:first-child > .group-label {
		padding-top: 0.5rem;
	}

	/* a group nested inside a group: a quieter, sentence-case sub-heading */
	.group .group .group-label {
		padding: 0.5rem 0.625rem 0.375rem 1.125rem;
		font-weight: 600;
		letter-spacing: 0;
		text-transform: none;
	}

	.group .group .group-chevron {
		display: none;
	}

	.group-label:hover {
		color: var(--foreground);
	}

	.group-label:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}

	.group-label > span {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.group-chevron {
		width: 0.75rem;
		height: 0.75rem;
		flex-shrink: 0;
		stroke: currentColor;
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
		transform: rotate(180deg);
		transition: transform var(--motion-fast) var(--ease-enter);
	}

	.group.is-closed .group-chevron {
		transform: rotate(0deg);
	}

	:host([is-collapsed]) .group-label {
		visibility: hidden;
		height: 0.5rem;
		padding: 0;
	}

	.link {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.625rem;
		border-radius: var(--radius-md);
		font-family: inherit;
		font-size: var(--font-size-small);
		font-weight: 500;
		color: var(--color-neutral-8);
		text-decoration: none;
		background: transparent;
		border: 0;
		text-align: left;
		width: 100%;
		box-sizing: border-box;
		cursor: pointer;
		white-space: nowrap;
		transition:
			color var(--motion-fast) var(--ease-enter),
			background-color var(--motion-fast) var(--ease-enter);
	}

	.link:hover {
		color: var(--foreground);
		background: color-mix(in oklch, var(--foreground) 6%, transparent);
	}

	.link.is-active {
		color: var(--accent);
		background: color-mix(in oklch, var(--accent) 12%, transparent);
	}

	:host(:not([is-collapsed])) .group .link {
		margin-left: 0.5rem;
		width: calc(100% - 0.5rem);
	}

	.group > .link:last-child,
	.group > .group:last-child {
		margin-bottom: 1rem;
	}

	.group .group > .link:last-child {
		margin-bottom: 0.5rem;
	}

	:host(:not([is-collapsed])) .group .group .link {
		margin-left: 1rem;
		width: calc(100% - 1rem);
	}

	.link:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	.icon,
	.initial {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
		flex-shrink: 0;
	}

	/* the initial is a collapsed-only fallback for links without an icon, so the
	   rail never renders an empty row when labels are hidden. */
	.initial {
		font-size: var(--font-size-small);
		font-weight: 600;
	}

	:host(:not([is-collapsed])) .initial {
		display: none;
	}

	.link-label {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		transition:
			opacity var(--motion-fast) var(--ease-enter),
			max-width var(--motion-fast) var(--ease-enter);
	}

	/* Collapsed rail: labels fade + slide away (rather than snap) so the width
	   animation reads as a smooth expand/collapse. */
	:host([is-collapsed]) .link-label {
		opacity: 0;
		max-width: 0;
		pointer-events: none;
	}
	:host([is-collapsed]) .badge {
		display: none;
	}

	:host([is-collapsed]) .link {
		justify-content: center;
		padding-inline: 0;
	}

	.badge {
		font-size: var(--font-size-caption);
		font-weight: 600;
		padding: 0.0625rem 0.4rem;
		border-radius: 999px;
		background: color-mix(in oklch, var(--accent) 18%, transparent);
		color: var(--accent);
	}
`

type LinkT = { value?: string; label: string; href?: string; icon?: string; badge?: string }
type GroupT = { label?: string; items: EntryT[] }
type EntryT = LinkT | GroupT

const isGroup = (entry: EntryT): entry is GroupT => Array.isArray((entry as GroupT).items)

export const ZSidebar = c(
	(props) => {
		const entries: EntryT[] = Array.isArray(props.items) ? (props.items as EntryT[]) : []
		const [hasHeader, setHasHeader] = useState(false)
		const [hasFooter, setHasFooter] = useState(false)
		const [closedGroups, setClosedGroups] = useState<string[]>([])
		const host = useHost()

		// keep the active entry in view when the value changes (e.g. arriving on
		// a deep link whose entry sits far down a long nav). Only the nav scrolls,
		// never the page around the sidebar.
		useEffect(() => {
			const root = (host.current as HTMLElement).shadowRoot
			const nav = root?.querySelector('nav')
			const active = root?.querySelector('.is-active')
			if (!nav || !active) return
			const bounds = nav.getBoundingClientRect()
			const rect = active.getBoundingClientRect()
			if (rect.top < bounds.top) nav.scrollTop -= bounds.top - rect.top + 12
			else if (rect.bottom > bounds.bottom) nav.scrollTop += rect.bottom - bounds.bottom + 12
		}, [props.value])

		const toggleGroup = (key: string) => {
			setClosedGroups((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
		}

		const pick = (link: LinkT) => {
			if (!link.href) props.select({ value: link.value || link.label })
		}

		const renderLink = (link: LinkT, key: string) => {
			const isActive = props.value != null && link.value === props.value
			const cls = isActive ? 'link is-active' : 'link'
			const inner = (
				<>
					{link.icon ? (
						<span class="icon" innerHTML={link.icon} />
					) : (
						<span class="initial" aria-hidden="true">
							{(link.label || '').charAt(0)}
						</span>
					)}
					<span class="link-label">{link.label}</span>
					{link.badge && <span class="badge">{link.badge}</span>}
				</>
			)
			return link.href ? (
				<a key={key} class={cls} href={link.href} aria-current={isActive ? 'page' : undefined} title={link.label}>
					{inner}
				</a>
			) : (
				<button
					key={key}
					type="button"
					class={cls}
					aria-current={isActive ? 'page' : undefined}
					title={link.label}
					onclick={() => pick(link)}
				>
					{inner}
				</button>
			)
		}

		// Groups nest one level deep: a top-level group may hold links and
		// sub-groups (rendered as quieter sub-headings). Order is the author's.
		const renderEntry = (entry: EntryT, key: string): unknown => {
			if (!isGroup(entry)) return renderLink(entry, `l-${key}`)
			const isClosed = closedGroups.includes(key)
			return (
				<div key={`g-${key}`} class={isClosed ? 'group is-closed' : 'group'}>
					{entry.label && (
						<button
							type="button"
							class="group-label"
							aria-expanded={isClosed ? 'false' : 'true'}
							onclick={() => toggleGroup(key)}
						>
							<span>{entry.label}</span>
							<svg class="group-chevron" viewBox="0 0 24 24" aria-hidden="true">
								<polyline points="6 9 12 15 18 9" />
							</svg>
						</button>
					)}
					{!isClosed && entry.items.map((child, ci) => renderEntry(child, `${key}-${ci}`))}
				</div>
			)
		}

		return (
			<host shadowDom>
				<div class={hasHeader ? 'head has-content' : 'head'}>
					<slot
						name="header"
						onslotchange={(e: Event) => setHasHeader((e.target as HTMLSlotElement).assignedNodes().length > 0)}
					/>
				</div>
				<nav>{entries.map((entry, index) => renderEntry(entry, `${index}`))}</nav>
				<div class={hasFooter ? 'foot has-content' : 'foot'}>
					<slot
						name="footer"
						onslotchange={(e: Event) => setHasFooter((e.target as HTMLSlotElement).assignedNodes().length > 0)}
					/>
				</div>
			</host>
		)
	},
	{
		props: {
			items: { type: Array },
			value: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			isCollapsed: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			isDocked: { type: Boolean, reflect: true },
			select: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles: [themedScrollbarStyles, styles]
	}
)

customElements.define('z-sidebar', ZSidebar)
