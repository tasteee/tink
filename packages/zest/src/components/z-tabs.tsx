import { c, css, event, useProp } from 'atomico'

/*
 * z-tabs — a tab list driven by a `tabs` array property:
 *   el.tabs = [{ value, label, isDisabled? }]
 * Panels are provided as named slots whose name matches each tab's value:
 *   <div slot="overview">…</div>
 * The active tab carries an accent underline; only the active panel renders.
 * Keyboard: ←/→ move between tabs (skipping disabled), Home/End jump to ends.
 * Fires `change` with { value } on selection.
 */
const styles = css`
	:host {
		display: block;
		--accent: var(--primary);
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

	.list {
		display: flex;
		gap: 0.25rem;
		border-bottom: 1px solid var(--border);
		user-select: none;
		-webkit-user-select: none;
	}

	:host([is-fitted]) .list {
		gap: 0;
	}

	.tab {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: transparent;
		border: 0;
		padding: 0.75rem 1rem;
		margin-bottom: -1px;
		font-family: inherit;
		font-size: var(--font-size-small);
		font-weight: 500;
		color: var(--muted-foreground);
		cursor: pointer;
		white-space: nowrap;
		border-bottom: 2px solid transparent;
		transition:
			color 0.12s ease,
			border-color 0.12s ease;
	}

	:host([is-fitted]) .tab {
		flex: 1;
	}

	.tab:hover {
		color: var(--foreground);
	}

	.tab.is-active {
		color: var(--accent);
		border-bottom-color: var(--accent);
	}

	.tab:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: -2px;
		border-radius: var(--radius-sm);
	}

	.tab:disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	.panel {
		padding-top: 1.25rem;
		color: var(--foreground);
	}
`

type TabT = { value: string; label: string; isDisabled?: boolean }

export const ZTabs = c(
	(props) => {
		const [value, setValue] = useProp<string>('value')

		const tabs: TabT[] = Array.isArray(props.tabs) ? (props.tabs as TabT[]) : []
		const active = value || (tabs[0] && tabs[0].value)

		const commit = (tab: TabT) => {
			if (tab.isDisabled) return
			setValue(tab.value)
			props.change({ value: tab.value })
		}

		const onKeyDown = (e: KeyboardEvent, index: number) => {
			let next = index
			if (e.key === 'ArrowRight') next = index + 1
			else if (e.key === 'ArrowLeft') next = index - 1
			else if (e.key === 'Home') next = 0
			else if (e.key === 'End') next = tabs.length - 1
			else return
			e.preventDefault()
			for (let i = 0; i < tabs.length; i++) {
				const candidate = ((next % tabs.length) + tabs.length) % tabs.length
				if (!tabs[candidate].isDisabled) {
					commit(tabs[candidate])
					break
				}
				next += e.key === 'ArrowLeft' ? -1 : 1
			}
		}

		return (
			<host shadowDom>
				<div class="list" role="tablist">
					{tabs.map((tab, index) => {
						const isActive = tab.value === active
						return (
							<button
								key={tab.value}
								type="button"
								class={isActive ? 'tab is-active' : 'tab'}
								role="tab"
								aria-selected={isActive ? 'true' : 'false'}
								tabindex={isActive ? '0' : '-1'}
								disabled={tab.isDisabled}
								onclick={() => commit(tab)}
								onkeydown={(e: KeyboardEvent) => onKeyDown(e, index)}
							>
								{tab.label}
							</button>
						)
					})}
				</div>
				{tabs.map((tab) =>
					tab.value === active ? (
						<div key={tab.value} class="panel" role="tabpanel">
							<slot name={tab.value} />
						</div>
					) : null
				)}
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true },
			tabs: { type: Array },
			tone: { type: String, reflect: true },
			isFitted: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-tabs', ZTabs)
