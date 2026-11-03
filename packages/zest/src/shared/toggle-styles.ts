import { css } from 'atomico'

/**
 * Every visual value is parked behind a --z-toggle-button-* custom property with a
 * literal default fallback (ghost + neutral + medium, matching the original
 * z-toggle-button.css defaults). A <z-toggle-button-group> can set these same properties on
 * its own :host; since they pierce the slot boundary via normal CSS custom
 * property inheritance, a <z-toggle-button-group-item> that doesn't declare its own
 * .is-* override class inherits the group's resolved variant for free. Nested
 * var() references (e.g. --z-toggle-button-hover-bg using var(--z-toggle-button-accent))
 * re-resolve against whichever element finally consumes them, so an item can
 * override just the color while inheriting kind from the group, or vice versa.
 */
export const toggleStyles = css`
	:host {
		display: inline-flex;
		user-select: none;
		-webkit-user-select: none;
	}

	:host([is-hidden]) {
		display: none;
	}

	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		font-family: inherit;
		font-weight: 500;
		white-space: nowrap;
		border-radius: var(--z-toggle-button-radius, var(--radius-md));
		cursor: pointer;
		line-height: 1;
		box-sizing: border-box;
		background: var(--z-toggle-button-bg, transparent);
		border: 1px solid var(--z-toggle-button-border, transparent);
		color: var(--z-toggle-button-color, var(--foreground));
		height: var(--z-toggle-button-height, var(--control-height-md));
		padding-inline: var(--z-toggle-button-padding-inline, 1rem);
		min-width: var(--z-toggle-button-min-width, 2.5rem);
		font-size: var(--z-toggle-button-font-size, 0.875rem);
		transition:
			opacity var(--motion-instant) var(--ease-enter),
			border-color var(--motion-instant) var(--ease-enter),
			background-color var(--motion-instant) var(--ease-enter),
			color var(--motion-instant) var(--ease-enter);
	}

	button:hover {
		background: var(--z-toggle-button-hover-bg, color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 8%, transparent));
		border-color: var(--z-toggle-button-hover-border, var(--z-toggle-button-border, transparent));
	}

	button[data-state='on'] {
		background: var(--z-toggle-button-on-bg, var(--z-toggle-button-accent, var(--primary)));
		color: var(--z-toggle-button-on-color, var(--z-toggle-button-accent-foreground, var(--primary-foreground)));
		border-color: var(--z-toggle-button-on-border, transparent);
	}

	button:focus-visible {
		outline: 3px solid var(--focus-ring);
		outline-offset: 2px;
	}

	button:disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	button.is-xs {
		--z-toggle-button-height: 1.75rem;
		--z-toggle-button-padding-inline: 0.625rem;
		--z-toggle-button-min-width: 1.75rem;
		--z-toggle-button-font-size: 0.75rem;
		--z-toggle-button-icon-size: 0.75rem;
	}

	button.is-sm {
		--z-toggle-button-height: var(--control-height-sm);
		--z-toggle-button-padding-inline: 0.75rem;
		--z-toggle-button-min-width: var(--control-height-sm);
		--z-toggle-button-font-size: 0.8125rem;
		--z-toggle-button-icon-size: 0.875rem;
	}

	button.is-lg {
		--z-toggle-button-height: var(--control-height-lg);
		--z-toggle-button-padding-inline: 1.25rem;
		--z-toggle-button-min-width: var(--control-height-lg);
		--z-toggle-button-font-size: 1rem;
		--z-toggle-button-icon-size: 1.125rem;
	}

	button.is-icon {
		padding-inline: 0;
		width: var(--z-toggle-button-height, var(--control-height-md));
	}

	button.is-primary {
		--z-toggle-button-color: var(--neon-purple);
		--z-toggle-button-accent: var(--neon-purple);
		--z-toggle-button-accent-foreground: var(--on-accent);
	}

	button.is-secondary {
		--z-toggle-button-color: var(--neon-pink);
		--z-toggle-button-accent: var(--neon-pink);
		--z-toggle-button-accent-foreground: var(--on-accent);
	}

	button.is-neutral {
		--z-toggle-button-color: var(--foreground);
		--z-toggle-button-accent: var(--primary);
		--z-toggle-button-accent-foreground: var(--primary-foreground);
	}

	button.is-success {
		--z-toggle-button-color: var(--success);
		--z-toggle-button-accent: var(--success);
		--z-toggle-button-accent-foreground: var(--on-accent);
	}

	button.is-warning {
		--z-toggle-button-color: var(--warning);
		--z-toggle-button-accent: var(--warning);
		--z-toggle-button-accent-foreground: var(--on-accent);
	}

	button.is-danger {
		--z-toggle-button-color: var(--destructive);
		--z-toggle-button-accent: var(--destructive);
		--z-toggle-button-accent-foreground: var(--on-accent);
	}

	button.is-ghost {
		--z-toggle-button-border: transparent;
		--z-toggle-button-hover-bg: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 10%, transparent);
		--z-toggle-button-on-bg: var(--z-toggle-button-accent, var(--primary));
		--z-toggle-button-on-color: var(--z-toggle-button-accent-foreground, var(--primary-foreground));
		--z-toggle-button-on-border: transparent;
	}

	/* off: tone-colored text (--z-toggle-button-color) + a dimmed tone border so the two
	   agree. on: solid tone fill with dark on-foreground text and a solid border. */
	button.is-outline {
		--z-toggle-button-border: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 50%, transparent);
		--z-toggle-button-hover-bg: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 10%, transparent);
		--z-toggle-button-on-bg: var(--z-toggle-button-accent, var(--primary));
		--z-toggle-button-on-color: var(--z-toggle-button-accent-foreground, var(--primary-foreground));
		--z-toggle-button-on-border: var(--z-toggle-button-accent, var(--primary));
	}

	/* solid: the resting state carries its own fill so the segment reads as
	   an object even before it is pressed. on keeps the same accent fill as
	   every other kind, just without a border change to announce it. */
	button.is-solid {
		--z-toggle-button-border: transparent;
		--z-toggle-button-bg: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 12%, var(--surface, transparent));
		--z-toggle-button-hover-bg: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 20%, var(--surface, transparent));
		--z-toggle-button-on-bg: var(--z-toggle-button-accent, var(--primary));
		--z-toggle-button-on-color: var(--z-toggle-button-accent-foreground, var(--primary-foreground));
		--z-toggle-button-on-border: transparent;
	}

	button.is-soft {
		--z-toggle-button-border: transparent;
		--z-toggle-button-bg: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 15%, transparent);
		color: var(--z-toggle-button-accent, var(--foreground));
		--z-toggle-button-hover-bg: color-mix(in oklch, var(--z-toggle-button-accent, var(--foreground)) 24%, transparent);
		--z-toggle-button-on-bg: var(--z-toggle-button-accent, var(--primary));
		--z-toggle-button-on-color: var(--z-toggle-button-accent-foreground, var(--primary-foreground));
		--z-toggle-button-on-border: transparent;
	}

	/* plain: text only at rest, an underline is the only affordance until it
	   is pressed. Matches z-button's plain treatment. */
	button.is-plain {
		--z-toggle-button-border: transparent;
		--z-toggle-button-hover-bg: transparent;
		--z-toggle-button-on-bg: var(--z-toggle-button-accent, var(--primary));
		--z-toggle-button-on-color: var(--z-toggle-button-accent-foreground, var(--primary-foreground));
		--z-toggle-button-on-border: transparent;
	}

	button.is-plain:hover {
		text-decoration: underline;
		text-underline-offset: 0.25em;
	}

	::slotted(svg) {
		width: var(--z-toggle-button-icon-size, 1rem);
		height: var(--z-toggle-button-icon-size, 1rem);
		flex-shrink: 0;
		pointer-events: none;
	}
`
