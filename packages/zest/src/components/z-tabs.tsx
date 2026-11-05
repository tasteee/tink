import { interactionStyles } from '../shared/interaction-styles'
import { c, css, event, useProp, useState, useHost, useRef, useEffect } from 'atomico'
import { oneOf } from '../shared/prop-types'
import { useChildItems, hasFlag } from '../shared/child-items'

/*
 * z-tabs, a tab list plus (optionally) its panels. Tabs are declarative
 * children, whose content becomes the tab label:
 *   <z-tab value="overview">Overview</z-tab>
 *   <z-tab value="billing" is-disabled>Billing</z-tab>
 * or a `tabs` array property: el.tabs = [{ value, label, isDisabled? }].
 *
 * Two ways to place content:
 *  - compound: give panels a slot named after their tab's value,
 *      <div slot="overview">…</div>
 *    and only the active one renders, wired up as the tabpanel.
 *  - controller: give it no panels at all. z-tabs is then just the tablist;
 *    read `value` / listen for `change` and render content anywhere.
 *
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
		overflow-x: auto;
		overflow-y: hidden;
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
			color var(--motion-fast) var(--ease-enter),
			border-color var(--motion-fast) var(--ease-enter);
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
		outline: 3px solid var(--focus-ring);
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

type TabT = { value: string; label: string; isDisabled?: boolean; slot?: string }

export const ZTabs = c(
	(props) => {
		const host = useHost()
		const pendingFocus = useRef<number>()
		const [value, setValue] = useProp<string>('value')
		useEffect(() => {
			if (pendingFocus.current === undefined) return
			host.current.shadowRoot?.querySelector<HTMLButtonElement>(`#tab-${pendingFocus.current}`)?.focus()
			pendingFocus.current = undefined
		})

		const [filledPanels, setFilledPanels] = useState<string[]>([])
		const childTabs: TabT[] = useChildItems('z-tab', ['is-disabled']).map((child) => ({
			value: child.value,
			label: child.label,
			isDisabled: hasFlag(child, 'is-disabled'),
			slot: child.slot
		}))
		const propTabs: TabT[] = Array.isArray(props.tabs) ? (props.tabs as TabT[]) : []
		const tabs: TabT[] = [...childTabs, ...propTabs]
		const requestedTab = tabs.find((tab) => tab.value === value && !tab.isDisabled)
		const firstEnabledTab = tabs.find((tab) => !tab.isDisabled)
		const active = requestedTab?.value ?? firstEnabledTab?.value

		const commit = (tab: TabT) => {
			if (tab.isDisabled || tab.value === active) return
			setValue(tab.value)
			props.change({ value: tab.value })
		}

		// In a right-to-left context the arrows swap: → moves to the tab that is
		// visually to the right, which is the previous one in document order.
		const isRightToLeft = () => getComputedStyle(host.current).direction === 'rtl'
		const onKeyDown = (e: KeyboardEvent, index: number) => {
			const forward = isRightToLeft() ? 'ArrowLeft' : 'ArrowRight'
			const backward = isRightToLeft() ? 'ArrowRight' : 'ArrowLeft'
			let next = index
			let step = 1
			if (e.key === forward) next = index + 1
			else if (e.key === backward) { next = index - 1; step = -1 }
			else if (e.key === 'Home') next = 0
			else if (e.key === 'End') { next = tabs.length - 1; step = -1 }
			else return
			e.preventDefault()
			for (let i = 0; i < tabs.length; i++) {
				const candidate = ((next % tabs.length) + tabs.length) % tabs.length
				if (!tabs[candidate].isDisabled) {
					pendingFocus.current = candidate
					commit(tabs[candidate])
					if (tabs[candidate].value === active) {
						host.current.shadowRoot?.querySelector<HTMLButtonElement>(`#tab-${candidate}`)?.focus()
						pendingFocus.current = undefined
					}
					break
				}
				next += step
			}
		}

		// Remembers which panel slots hold content, so empty panels
		// (controller mode) never claim the tabpanel role.
		const trackPanel = (tabValue: string, slotEvent: Event) => {
			const slot = slotEvent.target as HTMLSlotElement
			const hasNodes = slot.assignedNodes().length > 0
			// Several slots can report in the same tick, so build on the
			// latest list rather than this render's copy.
			setFilledPanels((current: string[]) => {
				const others = current.filter((value) => value !== tabValue)
				return hasNodes ? [...others, tabValue] : others
			})
		}

		return (
			<host shadowDom>
				{/* keyed: the panels below are a keyed list, and Atomico rebuilds
				    unkeyed siblings of one, which would drop focus from the tab */}
				<div key="tablist" class="list" role="tablist" aria-label={props.label}>
					{tabs.map((tab, index) => {
						const isActive = tab.value === active
						return (
							<button
								key={tab.value}
								type="button"
								class={isActive ? 'tab is-active' : 'tab'}
								role="tab"
								id={`tab-${index}`}
								aria-controls={`panel-${index}`}
								aria-selected={isActive ? 'true' : 'false'}
								tabindex={isActive ? '0' : '-1'}
								disabled={tab.isDisabled}
								onclick={() => { if (tab.value !== active) pendingFocus.current = index; commit(tab) }}
								onkeydown={(e: KeyboardEvent) => onKeyDown(e, index)}
							>
								{tab.slot ? <slot name={tab.slot} /> : tab.label}
							</button>
						)
					})}
				</div>
				{/* controller mode: a panel whose slot is empty stays out of the
				    accessibility tree, so z-tabs can drive content it does not own */}
				{tabs.map((tab, index) => {
					const isActivePanel = tab.value === active
					const hasContent = filledPanels.includes(tab.value)
					const isPanelShown = isActivePanel && hasContent
					return (
						<div
							key={tab.value}
							id={`panel-${index}`}
							class="panel"
							role={hasContent ? 'tabpanel' : undefined}
							aria-labelledby={`tab-${index}`}
							tabindex={isPanelShown ? '0' : undefined}
							hidden={!isPanelShown}
						>
							<slot name={tab.value} onslotchange={(slotEvent: Event) => trackPanel(tab.value, slotEvent)} />
						</div>
					)
				})}
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true },
			label: String,
			tabs: { type: Array },
			tone: { type: oneOf('primary', 'secondary'), reflect: true },
			isFitted: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles: [styles, interactionStyles]
	}
)


/*
 * z-tab, one declarative z-tabs tab. `value` names it (and the panel slot it
 * shows); its children are the tab's label. `is-disabled` skips it.
 */
export const ZTab = c(
	() => (
		<host shadowDom>
			<slot />
		</host>
	),
	{
		props: {
			value: { type: String, reflect: true },
			isDisabled: { type: Boolean, reflect: true }
		},
		styles: css`
			:host {
				display: inline-flex;
				align-items: center;
				gap: 0.5rem;
			}
		`
	}
)

