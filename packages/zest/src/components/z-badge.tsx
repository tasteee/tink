import { c, css, event } from 'atomico'

/*
 * z-badge — a compact pill for status, metadata, and tags. Three kinds (soft
 * tint, solid fill, outline) across the full tone set, in two sizes, plus an
 * `is-dot` inline-status mode (a leading colored dot + uppercase tracked text,
 * e.g. • ONLINE). No shadows.
 *
 * Static by default. Opt into interactivity — this is what used to be z-chip:
 *   - `is-selectable` / `is-selected` makes it a toggle (role=button), emitting
 *     `select` with { value, selected }.
 *   - `is-removable` renders a × that emits `remove` with { value }.
 *   - the `prefix` slot holds a leading avatar/icon.
 * A badge with none of these stays purely presentational (no role, no tabstop).
 */
const styles = css`
	:host {
		display: inline-flex;
		vertical-align: middle;
		user-select: none;
		-webkit-user-select: none;
	}

	:host([is-hidden]) {
		display: none;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-family: inherit;
		font-weight: 600;
		line-height: 1;
		white-space: nowrap;
		border: 1px solid transparent;
		border-radius: 999px;
		--tone: var(--color-neutral-7);
	}

	/* tones set --tone */
	.badge.is-primary {
		--tone: var(--purple);
	}
	.badge.is-secondary {
		--tone: var(--pink);
	}
	.badge.is-neutral {
		--tone: var(--color-neutral-7);
	}
	.badge.is-success {
		--tone: var(--success);
	}
	.badge.is-warning {
		--tone: var(--warning);
	}
	.badge.is-danger {
		--tone: var(--destructive);
	}

	/* sizes */
	.badge.is-small {
		font-size: 0.6875rem;
		padding: 0.25rem 0.5rem;
		letter-spacing: 0.01em;
	}
	.badge.is-medium {
		font-size: 0.75rem;
		padding: 0.3125rem 0.625rem;
	}

	/* kinds */
	.badge.is-soft {
		background: color-mix(in oklch, var(--tone) 18%, transparent);
		color: color-mix(in oklch, var(--tone) 80%, white);
	}
	.badge.is-solid {
		background: var(--tone);
		color: var(--primary-foreground);
	}
	/* purple/pink fills are light enough that dark text muddies; use neutral-8. */
	.badge.is-solid.is-primary,
	.badge.is-solid.is-secondary {
		color: var(--color-neutral-8);
	}
	.badge.is-outline {
		background: transparent;
		/* srgb, not oklch: --border carries a faint green hue, and interpolating
		   hue against it in oklch drags the tone around the wheel (purple → blue). */
		border-color: color-mix(in srgb, var(--tone) 45%, var(--border));
		color: var(--tone);
	}
	.badge.is-neutral.is-outline {
		color: var(--muted-foreground);
		border-color: var(--border);
	}

	/* inline status: dot + uppercase tracked text */
	.badge.is-dot {
		background: transparent;
		border-color: transparent;
		padding: 0;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.6875rem;
		color: var(--tone);
		gap: 0.4375rem;
	}
	.dot {
		width: 0.4375rem;
		height: 0.4375rem;
		border-radius: 999px;
		background: var(--tone);
		flex-shrink: 0;
	}

	.is-solid.is-primary .label,
	.is-solid.is-secondary .label {
		text-shadow: 0 0px 18px var(--primary-foreground);
	}

	/* ── interactive states (opt-in via is-selectable / is-selected) ────────── */

	.badge.is-clickable {
		cursor: pointer;
		transition:
			border-color 0.12s ease,
			background-color 0.12s ease,
			color 0.12s ease;
	}
	.badge.is-clickable:hover {
		border-color: color-mix(in srgb, var(--tone) 55%, var(--border));
	}

	/* Selected wins over the resting kind: a toned tint + border regardless of
	   whether the badge started soft/solid/outline. */
	.badge.is-selected {
		background: color-mix(in oklch, var(--tone) 16%, transparent);
		border-color: color-mix(in oklch, var(--tone) 50%, transparent);
		color: color-mix(in oklch, var(--tone) 85%, white);
	}
	.badge.is-neutral.is-selected {
		color: var(--foreground);
	}

	.badge.is-disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	.badge:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	/* ── remove affordance (is-removable) ───────────────────────────────────── */

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
		transition:
			opacity 0.12s ease,
			background-color 0.12s ease;
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
		width: 0.875em;
		height: 0.875em;
	}
	::slotted(img) {
		width: 1.125rem;
		height: 1.125rem;
		border-radius: 999px;
		margin-left: -0.25rem;
		object-fit: cover;
	}
`

const resolveToneClass = (props: any): string => {
	if (props.tone === 'primary') return 'is-primary'
	if (props.tone === 'secondary') return 'is-secondary'
	if (props.tone === 'success') return 'is-success'
	if (props.tone === 'warning') return 'is-warning'
	if (props.tone === 'danger') return 'is-danger'
	return 'is-neutral'
}

const resolveKindClass = (props: any): string => {
	if (props.kind === 'solid') return 'is-solid'
	if (props.kind === 'outline') return 'is-outline'
	return 'is-soft'
}

export const ZBadge = c(
	(props) => {
		const sizeClass = props.size === 'small' ? 'is-small' : 'is-medium'
		const isClickable = props.isSelectable && !props.isDisabled

		const badgeClass = [
			'badge',
			resolveToneClass(props),
			props.isDot ? 'is-dot' : resolveKindClass(props),
			sizeClass
		]
			.concat(isClickable ? ['is-clickable'] : [])
			.concat(props.isSelected ? ['is-selected'] : [])
			.concat(props.isDisabled ? ['is-disabled'] : [])
			.join(' ')

		const toggle = () => {
			if (isClickable) props.select({ value: props.value, selected: !props.isSelected })
		}

		return (
			<host shadowDom>
				<span
					class={badgeClass}
					tabindex={isClickable ? 0 : undefined}
					role={props.isSelectable ? 'button' : undefined}
					aria-pressed={props.isSelectable ? (props.isSelected ? 'true' : 'false') : undefined}
					onclick={toggle}
					onkeydown={(e: KeyboardEvent) => {
						if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
							e.preventDefault()
							toggle()
						}
					}}
				>
					{props.isDot && <span class='dot' aria-hidden='true'></span>}
					<slot name='prefix' />
					<span class='label'>{props.label ? props.label : <slot />}</span>
					{props.isRemovable && (
						<button
							class='remove'
							type='button'
							aria-label='Remove'
							onclick={(e: Event) => {
								e.stopPropagation()
								props.remove({ value: props.value })
							}}
						>
							<svg viewBox='0 0 12 12'>
								<path d='M3 3l6 6M9 3l-6 6' />
							</svg>
						</button>
					)}
				</span>
			</host>
		)
	},
	{
		props: {
			tone: { type: String, reflect: true },
			kind: { type: String, reflect: true },
			size: { type: String, reflect: true },
			label: String,
			value: String,
			isDot: { type: Boolean, reflect: true },
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

customElements.define('z-badge', ZBadge)
