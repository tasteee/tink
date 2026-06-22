import { c, css, event } from 'atomico'

/*
 * z-chip — an interactive tag. Like a badge, but built for input: it can hold a
 * leading slot (avatar/icon), be selectable, and carry a remove affordance.
 * Emits `remove` when the × is clicked and `select` when the chip is toggled.
 * Borders-only; selection is shown with an accent tint, never a shadow.
 */
const styles = css`
	:host {
		display: inline-flex;
		vertical-align: middle;
	}

	:host([is-hidden]) {
		display: none;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4375rem;
		font-family: inherit;
		font-size: 0.8125rem;
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: transparent;
		color: var(--foreground);
		padding: 0.375rem 0.75rem;
		--tone: var(--purple);
		transition: border-color 0.12s ease, background-color 0.12s ease, color 0.12s ease;
	}

	:host([tone='secondary']) .chip {
		--tone: var(--pink);
	}

	.chip.is-clickable {
		cursor: pointer;
	}
	.chip.is-clickable:hover {
		border-color: color-mix(in oklch, var(--foreground) 35%, transparent);
	}

	.chip.is-selected {
		background: color-mix(in oklch, var(--tone) 16%, transparent);
		border-color: color-mix(in oklch, var(--tone) 50%, transparent);
		color: color-mix(in oklch, var(--tone) 85%, white);
	}

	.chip.is-disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.chip:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	.remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		margin-right: -0.25rem;
		border: none;
		border-radius: 999px;
		background: transparent;
		color: currentColor;
		cursor: pointer;
		padding: 0;
		opacity: 0.6;
		transition: opacity 0.12s ease, background-color 0.12s ease;
	}
	.remove:hover {
		opacity: 1;
		background: color-mix(in oklch, var(--foreground) 18%, transparent);
	}
	.remove svg {
		width: 0.625rem;
		height: 0.625rem;
		stroke: currentColor;
		stroke-width: 2.5;
		stroke-linecap: round;
		fill: none;
	}

	::slotted(svg) {
		width: 0.875rem;
		height: 0.875rem;
	}
	::slotted(img) {
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 999px;
		margin-left: -0.25rem;
		object-fit: cover;
	}
`

export const ZChip = c(
	(props) => {
		const isClickable = props.isSelectable && !props.isDisabled

		const chipClass = ['chip']
			.concat(isClickable ? ['is-clickable'] : [])
			.concat(props.isSelected ? ['is-selected'] : [])
			.concat(props.isDisabled ? ['is-disabled'] : [])
			.join(' ')

		return (
			<host shadowDom>
				<span
					class={chipClass}
					tabindex={isClickable ? 0 : undefined}
					role={props.isSelectable ? 'button' : undefined}
					aria-pressed={props.isSelectable ? (props.isSelected ? 'true' : 'false') : undefined}
					onclick={() => {
						if (isClickable) props.select({ value: props.value, selected: !props.isSelected })
					}}
					onkeydown={(e: KeyboardEvent) => {
						if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
							e.preventDefault()
							props.select({ value: props.value, selected: !props.isSelected })
						}
					}}
				>
					<slot name="prefix" />
					{props.label ? props.label : <slot />}
					{props.isRemovable && (
						<button
							class="remove"
							type="button"
							aria-label="Remove"
							onclick={(e: Event) => {
								e.stopPropagation()
								props.remove({ value: props.value })
							}}
						>
							<svg viewBox="0 0 12 12">
								<path d="M3 3l6 6M9 3l-6 6" />
							</svg>
						</button>
					)}
				</span>
			</host>
		)
	},
	{
		props: {
			label: String,
			value: String,
			tone: { type: String, reflect: true },
			isSelectable: { type: Boolean, reflect: true },
			isSelected: { type: Boolean, reflect: true },
			isRemovable: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			select: event<{ value?: string; selected: boolean }>({ bubbles: true, composed: true }),
			remove: event<{ value?: string }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-chip', ZChip)
