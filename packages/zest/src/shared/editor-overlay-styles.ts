import { css } from 'atomico'

/*
 * Shared chrome for the text-editor floating family (selection toolbar, slash
 * menu, mention popover, bubble menu, table toolbar, drag/table handles).
 * These don't ride the Popover API like z-popover/z-menu — they need a
 * fade-only exit distinct from the fade+rise entrance (spec: enter 120ms
 * ease-out with a 4px rise, exit 80ms fade only, no position change), which
 * the Popover API's discrete show/hide doesn't give us for free. Instead each
 * component is a persistent singleton (same shape as z-toast) positioned via
 * shared/overlay.ts, and drives these three classes from useVisibilityPhase
 * (shared/transition.ts):
 *
 *  - .surface            base: invisible, resting 4px below its open position
 *  - .surface.is-open     entrance: fades + rises in over 120ms ease-out
 *  - .surface.is-closing  exit: fades in place over 80ms, no transform change
 *
 * "Borders over shadows" still applies — depth comes from --border + --popover,
 * never a box-shadow.
 */
export const floatingSurfaceStyles = css`
	.surface {
		position: fixed;
		left: 0;
		top: 0;
		margin: 0;
		box-sizing: border-box;
		background: var(--popover);
		color: var(--popover-foreground);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		opacity: 0;
		transform: translateY(4px);
		pointer-events: none;
	}

	.surface.is-open {
		opacity: 1;
		transform: translateY(0);
		transition:
			opacity 120ms ease-out,
			transform 120ms ease-out;
		pointer-events: auto;
	}

	.surface.is-closing {
		opacity: 0;
		transform: translateY(0);
		transition: opacity 80ms ease-out;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.surface,
		.surface.is-open,
		.surface.is-closing {
			transition: none;
		}
	}
`

/* A pill-shaped toolbar strip — selection toolbar, bubble menu, table toolbar. */
export const floatingToolbarStyles = css`
	.surface {
		z-index: var(--z-toolbar, 40);
		display: flex;
		align-items: center;
		gap: 1px;
		padding: 0.25rem;
	}
`

/* A vertical listbox/menu panel — slash menu, mention popover. */
export const floatingMenuStyles = css`
	.surface {
		z-index: var(--z-menu, 50);
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 14rem;
		max-width: 20rem;
		max-height: 18rem;
		overflow-y: auto;
		padding: 0.3125rem;
	}
`

/* Shared row chrome for menu-style items (slash menu, mention popover) —
 * mirrors z-menu.tsx's .item/.is-active/.is-disabled language exactly. */
export const floatingMenuItemStyles = css`
	.item {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.625rem;
		border-radius: var(--radius-sm);
		font-size: var(--font-size-small);
		color: var(--foreground);
		cursor: pointer;
		user-select: none;
		background: transparent;
		border: 0;
		font-family: inherit;
		text-align: left;
		width: 100%;
		box-sizing: border-box;
	}

	.item.is-active {
		background: color-mix(in oklch, var(--accent, var(--primary)) 14%, transparent);
		color: var(--accent, var(--primary));
	}

	.item.is-disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	.item .icon {
		display: inline-flex;
		width: 1.125rem;
		height: 1.125rem;
		flex-shrink: 0;
		color: var(--muted-foreground);
	}

	.item .label {
		flex: 1;
		min-width: 0;
	}

	.item .description {
		color: var(--muted-foreground);
		font-size: var(--font-size-caption);
	}

	.empty {
		padding: 0.75rem;
		text-align: center;
		color: var(--muted-foreground);
		font-size: var(--font-size-small);
	}
`

/* A small icon-only button — toolbar actions, gutter/drag handle grips. */
export const floatingIconButtonStyles = css`
	.icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		flex-shrink: 0;
		background: transparent;
		border: 0;
		border-radius: var(--radius-sm);
		color: var(--muted-foreground);
		cursor: pointer;
		transition:
			color 0.12s ease,
			background-color 0.12s ease;
	}

	.icon-button:hover {
		color: var(--foreground);
		background: color-mix(in oklch, var(--foreground) 8%, transparent);
	}

	.icon-button.is-active {
		color: var(--accent, var(--primary));
		background: color-mix(in oklch, var(--accent, var(--primary)) 14%, transparent);
	}

	.icon-button:disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	.icon-button svg {
		width: 1.125rem;
		height: 1.125rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		fill: none;
	}

	.sep {
		width: 1px;
		align-self: stretch;
		margin: 0.25rem 0.125rem;
		background: var(--border);
	}
`
