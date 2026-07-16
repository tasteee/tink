import { c, css, event, useState, useHost, useEffect } from 'atomico'

/*
 * z-nav-menu — a horizontal navigation bar driven by an `items` array property:
 *   el.items = [
 *     { value, label, href? },
 *     { value, label, children: [{ value, label, href?, description? }] }
 *   ]
 * Top-level items with `children` open a bordered dropdown panel on click; plain
 * items are links. The active top item (matched against the `value` property) is
 * accent-colored. Esc / outside-click closes any open panel. Fires `select` with
 * { value } whenever an item without an href is chosen.
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

	nav {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.top {
		position: relative;
	}

	.trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		background: transparent;
		border: 0;
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-md);
		font-family: inherit;
		font-size: var(--font-size-small);
		font-weight: 500;
		color: var(--muted-foreground);
		text-decoration: none;
		cursor: pointer;
		white-space: nowrap;
		transition:
			color 0.12s ease,
			background-color 0.12s ease;
	}

	.trigger:hover {
		color: var(--foreground);
		background: color-mix(in oklch, var(--foreground) 6%, transparent);
	}

	.trigger.is-active {
		color: var(--color-neutral-9);
	}

	.trigger.is-open {
		color: var(--accent);
		background: color-mix(in oklch, var(--accent) 8%, transparent);
	}

	.trigger:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	.caret {
		width: 0.75rem;
		height: 0.75rem;
		stroke: currentColor;
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
		transition: transform 0.15s ease;
	}

	.trigger.is-open .caret {
		transform: rotate(180deg);
	}

	.panel {
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		z-index: 50;
		min-width: 16rem;
		background: var(--popover);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.375rem;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.child {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.5rem 0.625rem;
		border-radius: var(--radius-sm);
		color: var(--foreground);
		text-decoration: none;
		background: transparent;
		border: 0;
		font-family: inherit;
		text-align: left;
		cursor: pointer;
	}

	.child:hover {
		background: color-mix(in oklch, var(--accent) 12%, transparent);
	}

	.child .child-label {
		font-size: var(--font-size-small);
		font-weight: 500;
	}

	.child .child-desc {
		font-size: var(--font-size-caption);
		color: var(--muted-foreground);
	}
`

type ChildT = { value?: string; label: string; href?: string; description?: string }
type NavItemT = { value?: string; label: string; href?: string; children?: ChildT[] }

export const ZNavMenu = c(
	(props) => {
		const host = useHost()
		const [openValue, setOpenValue] = useState<string | null>(null)

		const items: NavItemT[] = Array.isArray(props.items) ? (props.items as NavItemT[]) : []

		useEffect(() => {
			if (openValue == null) return
			const onDocumentPointerDown = (e: Event) => {
				if (!e.composedPath().includes(host.current as EventTarget)) setOpenValue(null)
			}
			const onKey = (e: KeyboardEvent) => {
				if (e.key === 'Escape') setOpenValue(null)
			}
			document.addEventListener('pointerdown', onDocumentPointerDown)
			document.addEventListener('keydown', onKey)
			return () => {
				document.removeEventListener('pointerdown', onDocumentPointerDown)
				document.removeEventListener('keydown', onKey)
			}
		}, [openValue])

		const pick = (value: string) => {
			setOpenValue(null)
			props.select({ value })
		}

		return (
			<host shadowDom>
				<nav>
					{items.map((item, index) => {
						const key = item.value || item.label || String(index)
						const isActive = props.value != null && item.value === props.value
						if (item.children && item.children.length) {
							const isOpen = openValue === key
							const triggerClass = ['trigger']
								.concat(isActive ? ['is-active'] : [])
								.concat(isOpen ? ['is-open'] : [])
								.join(' ')
							return (
								<div key={key} class='top'>
									<button
										type='button'
										class={triggerClass}
										aria-haspopup='menu'
										aria-expanded={isOpen ? 'true' : 'false'}
										onclick={() => setOpenValue(isOpen ? null : key)}
									>
										{item.label}
										<svg class='caret' viewBox='0 0 24 24'>
											<polyline points='6 9 12 15 18 9' />
										</svg>
									</button>
									{isOpen && (
										<div class='panel' role='menu'>
											{item.children.map((child, ci) => {
												const ckey = child.value || child.label || String(ci)
												const content = (
													<>
														<span class='child-label'>{child.label}</span>
														{child.description && <span class='child-desc'>{child.description}</span>}
													</>
												)
												return child.href ? (
													<a key={ckey} class='child' href={child.href} role='menuitem'>
														{content}
													</a>
												) : (
													<button
														key={ckey}
														type='button'
														class='child'
														role='menuitem'
														onclick={() => pick(child.value || child.label)}
													>
														{content}
													</button>
												)
											})}
										</div>
									)}
								</div>
							)
						}

						const triggerClass = isActive ? 'trigger is-active' : 'trigger'
						return item.href ? (
							<a key={key} class={triggerClass} href={item.href}>
								{item.label}
							</a>
						) : (
							<button key={key} type='button' class={triggerClass} onclick={() => pick(item.value || item.label)}>
								{item.label}
							</button>
						)
					})}
				</nav>
			</host>
		)
	},
	{
		props: {
			items: { type: Array },
			value: { type: String, reflect: true },
			tone: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			select: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-nav-menu', ZNavMenu)
