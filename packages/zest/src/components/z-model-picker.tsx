import { c, css, event, useProp, useHost, useEffect } from 'atomico'

/*
 * z-model-picker — the composer control for choosing which model answers. Shows
 * the selected model; opens a dropdown of options (name + description, check on
 * the current one). Emits `change` {value}. Data-driven:
 *
 *   el.models = [{ value: 'opus', name: 'Opus 4.8', description: 'Most capable' }, …]
 *   el.value = 'opus'
 */
type Model = { value: string; name: string; description?: string }

const styles = css`
	:host {
		display: inline-block;
		position: relative;
	}
	:host([is-hidden]) {
		display: none;
	}
	.trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border: 1px solid var(--border);
		background: var(--card);
		border-radius: var(--radius-md);
		padding: 0.35rem 0.6rem;
		font-family: inherit;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--foreground);
		cursor: pointer;
	}
	.trigger:hover {
		border-color: color-mix(in oklch, var(--foreground) 30%, transparent);
	}
	.chevron {
		width: 0.85rem;
		height: 0.85rem;
		stroke: var(--muted-foreground);
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: transform 0.15s ease;
	}
	:host([is-open]) .chevron {
		transform: rotate(180deg);
	}
	.menu {
		position: absolute;
		z-index: 50;
		bottom: calc(100% + 0.375rem);
		left: 0;
		min-width: 15rem;
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: 0 8px 24px color-mix(in oklch, var(--foreground) 15%, transparent);
		padding: 0.25rem;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	:host([menu-below]) .menu {
		bottom: auto;
		top: calc(100% + 0.375rem);
	}
	.item {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		border: none;
		background: transparent;
		border-radius: var(--radius-sm);
		padding: 0.4rem 0.5rem;
		text-align: left;
		font-family: inherit;
		color: var(--foreground);
		cursor: pointer;
	}
	.item:hover {
		background: color-mix(in oklch, var(--foreground) 8%, transparent);
	}
	.check {
		flex: 0 0 auto;
		width: 1rem;
		height: 1rem;
		margin-top: 0.1rem;
		stroke: var(--primary);
		fill: none;
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0;
	}
	.item.is-selected .check {
		opacity: 1;
	}
	.body {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}
	.name {
		font-size: 0.8125rem;
		font-weight: 600;
	}
	.desc {
		font-size: 0.6875rem;
		color: var(--muted-foreground);
	}
`

export const ZModelPicker = c(
	(props) => {
		const host = useHost()
		const [isOpen, setIsOpen] = useProp<boolean>('isOpen')
		const models: Model[] = Array.isArray(props.models) ? (props.models as Model[]) : []
		const selected = models.find((m) => m.value === props.value)

		useEffect(() => {
			if (!isOpen) return
			const onDown = (e: Event) => {
				if (!e.composedPath().includes(host.current as EventTarget)) setIsOpen(false)
			}
			document.addEventListener('pointerdown', onDown)
			return () => document.removeEventListener('pointerdown', onDown)
		}, [isOpen])

		const pick = (m: Model) => {
			setIsOpen(false)
			if (m.value !== props.value) props.change({ value: m.value })
		}

		return (
			<host shadowDom>
				<button
					class="trigger"
					type="button"
					aria-haspopup="listbox"
					aria-expanded={isOpen ? 'true' : 'false'}
					onclick={() => setIsOpen(!isOpen)}
				>
					{selected?.name || props.placeholder || 'Select model'}
					<svg class="chevron" viewBox="0 0 24 24" aria-hidden="true">
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>
				{isOpen && (
					<div class="menu" role="listbox">
						{models.map((m) => (
							<button
								key={m.value}
								class={m.value === props.value ? 'item is-selected' : 'item'}
								type="button"
								role="option"
								aria-selected={m.value === props.value ? 'true' : 'false'}
								onclick={() => pick(m)}
							>
								<svg class="check" viewBox="0 0 24 24" aria-hidden="true">
									<polyline points="4 12 10 18 20 6" />
								</svg>
								<span class="body">
									<span class="name">{m.name}</span>
									{m.description && <span class="desc">{m.description}</span>}
								</span>
							</button>
						))}
					</div>
				)}
			</host>
		)
	},
	{
		props: {
			models: { type: Array },
			value: { type: String, reflect: true },
			placeholder: { type: String, reflect: true },
			menuBelow: { type: Boolean, reflect: true },
			isOpen: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			change: event<{ value: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-model-picker', ZModelPicker)
