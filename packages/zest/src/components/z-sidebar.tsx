import { c, css, event } from 'atomico'

/*
 * z-sidebar — a vertical navigation rail driven by an `items` array property.
 * Entries are either links or groups:
 *   el.items = [
 *     { value, label, icon?, badge? },                     // top-level link
 *     { label: 'Workspace', items: [ { value, label, icon? } ] }  // group
 *   ]
 * The entry whose value matches the `value` property is marked active with an
 * accent tint and rule. A `header` slot and `footer` slot bracket the nav.
 * `is-collapsed` shrinks it to an icon rail. Fires `select` with { value }.
 */
const styles = css`
	:host {
		display: flex;
		flex-direction: column;
		width: var(--z-sidebar-width, 16rem);
		box-sizing: border-box;
		height: 100%;
		background: var(--color-neutral-0);
		border: 1px solid var(--sidebar-border);
		border-radius: var(--radius-lg);
		padding: var(--space-md);
		color: var(--sidebar-foreground);
		--accent: var(--purple);
		transition: width 0.16s ease;
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

	.head:not(:empty) {
		padding: 0.25rem 0.5rem 0.75rem;
	}

	.foot:not(:empty) {
		margin-top: auto;
		padding-top: 0.75rem;
		border-top: 1px solid var(--sidebar-border);
	}

	nav {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		overflow-y: auto;
	}

	/* Firefox has no ::-webkit-scrollbar and never draws arrows — give it the
	   standard thin themed bar. Chromium must NOT get scrollbar-width: with it set,
	   Chrome falls back to the OS scrollbar (stepper arrows on Windows) and ignores
	   the custom rules below. */
	@supports not selector(::-webkit-scrollbar) {
		nav {
			scrollbar-width: thin;
			scrollbar-color: var(--color-neutral-3) transparent;
		}
	}

	/* WebKit / Chromium — slim, track-less, arrow-less */
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
	/* No stepper arrows — Windows Chromium renders them otherwise. */
	nav::-webkit-scrollbar-button {
		display: none;
		width: 0;
		height: 0;
	}

	.group + .group {
		margin-top: 1rem;
	}

	.group-label {
		padding: 0.5rem 0.625rem 0.25rem;
		font-size: var(--font-size-caption);
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted-foreground);
		white-space: nowrap;
		overflow: hidden;
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
		color: var(--muted-foreground);
		text-decoration: none;
		background: transparent;
		border: 0;
		text-align: left;
		width: 100%;
		box-sizing: border-box;
		cursor: pointer;
		white-space: nowrap;
		transition:
			color 0.12s ease,
			background-color 0.12s ease;
	}

	.link:hover {
		color: var(--foreground);
		background: color-mix(in oklch, var(--foreground) 6%, transparent);
	}

	.link.is-active {
		color: var(--accent);
		background: color-mix(in oklch, var(--accent) 12%, transparent);
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
	}

	:host([is-collapsed]) .link-label,
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
type GroupT = { label?: string; items: LinkT[] }
type EntryT = LinkT | GroupT

const isGroup = (entry: EntryT): entry is GroupT => Array.isArray((entry as GroupT).items)

export const ZSidebar = c(
	(props) => {
		const entries: EntryT[] = Array.isArray(props.items) ? (props.items as EntryT[]) : []

		const pick = (link: LinkT) => {
			if (!link.href) props.select({ value: link.value || link.label })
		}

		const renderLink = (link: LinkT, key: string) => {
			const isActive = props.value != null && link.value === props.value
			const cls = isActive ? 'link is-active' : 'link'
			const inner = (
				<>
					{link.icon ? (
						<span class='icon' innerHTML={link.icon} />
					) : (
						<span class='initial' aria-hidden='true'>
							{(link.label || '').charAt(0)}
						</span>
					)}
					<span class='link-label'>{link.label}</span>
					{link.badge && <span class='badge'>{link.badge}</span>}
				</>
			)
			return link.href ? (
				<a key={key} class={cls} href={link.href} aria-current={isActive ? 'page' : undefined} title={link.label}>
					{inner}
				</a>
			) : (
				<button
					key={key}
					type='button'
					class={cls}
					aria-current={isActive ? 'page' : undefined}
					title={link.label}
					onclick={() => pick(link)}
				>
					{inner}
				</button>
			)
		}

		return (
			<host shadowDom>
				<div class='head'>
					<slot name='header' />
				</div>
				<nav>
					{entries.map((entry, index) => {
						if (isGroup(entry)) {
							return (
								<div key={`g-${index}`} class='group'>
									{entry.label && <div class='group-label'>{entry.label}</div>}
									{entry.items.map((link, li) => renderLink(link, `g-${index}-${li}`))}
								</div>
							)
						}
						return renderLink(entry, `l-${index}`)
					})}
				</nav>
				<div class='foot'>
					<slot name='footer' />
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
			select: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-sidebar', ZSidebar)
