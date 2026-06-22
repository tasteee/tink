import { css } from 'atomico'

/**
 * Every visual value is parked behind a --z-toggle-* custom property with a
 * literal default fallback (ghost + neutral + medium, matching the original
 * z-toggle.css defaults). A <z-toggle-group> can set these same properties on
 * its own :host; since they pierce the slot boundary via normal CSS custom
 * property inheritance, a <z-toggle-group-item> that doesn't declare its own
 * .is-* override class inherits the group's resolved variant for free. Nested
 * var() references (e.g. --z-toggle-hover-bg using var(--z-toggle-accent))
 * re-resolve against whichever element finally consumes them, so an item can
 * override just the color while inheriting kind from the group, or vice versa.
 */
export const toggleStyles = css`
	:host {
		display: inline-flex;
	}

	:host([is-hidden]) {
		display: none;
	}

	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-family: inherit;
		font-weight: 500;
		white-space: nowrap;
		border-radius: var(--z-toggle-radius, var(--radius-md));
		cursor: pointer;
		line-height: 1;
		box-sizing: border-box;
		background: transparent;
		border: 1px solid var(--z-toggle-border, transparent);
		color: var(--z-toggle-color, var(--foreground));
		height: var(--z-toggle-height, 2.5rem);
		padding-inline: var(--z-toggle-padding-inline, 1rem);
		min-width: var(--z-toggle-min-width, 2.5rem);
		font-size: var(--z-toggle-font-size, 0.875rem);
		transition:
			opacity 0.1s ease,
			border-color 0.1s ease,
			background-color 0.1s ease,
			color 0.1s ease;
	}

	button:hover {
		background: var(--z-toggle-hover-bg, color-mix(in oklch, var(--z-toggle-accent, var(--foreground)) 8%, transparent));
		border-color: var(--z-toggle-hover-border, var(--z-toggle-border, transparent));
	}

	button[data-state='on'] {
		background: var(--z-toggle-on-bg, var(--z-toggle-accent, var(--primary)));
		color: var(--z-toggle-on-color, var(--z-toggle-accent-foreground, var(--primary-foreground)));
		border-color: var(--z-toggle-on-border, transparent);
	}

	button:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	button:disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	button.is-small {
		--z-toggle-height: 2rem;
		--z-toggle-padding-inline: 0.75rem;
		--z-toggle-min-width: 2rem;
		--z-toggle-font-size: 0.8125rem;
		--z-toggle-icon-size: 0.875rem;
	}

	button.is-large {
		--z-toggle-height: 3rem;
		--z-toggle-padding-inline: 1.25rem;
		--z-toggle-min-width: 3rem;
		--z-toggle-font-size: 1rem;
		--z-toggle-icon-size: 1.125rem;
	}

	button.is-icon {
		padding-inline: 0;
		width: var(--z-toggle-height, 2.5rem);
	}

	button.is-purple {
		--z-toggle-color: var(--neon-purple);
		--z-toggle-accent: var(--neon-purple);
		--z-toggle-accent-foreground: var(--primary-foreground);
	}

	button.is-pink {
		--z-toggle-color: var(--neon-pink);
		--z-toggle-accent: var(--neon-pink);
		--z-toggle-accent-foreground: var(--primary-foreground);
	}

	button.is-neutral {
		--z-toggle-color: var(--foreground);
		--z-toggle-accent: var(--primary);
		--z-toggle-accent-foreground: var(--primary-foreground);
	}

	button.is-ghost {
		--z-toggle-border: transparent;
		--z-toggle-hover-bg: color-mix(in oklch, var(--z-toggle-accent, var(--foreground)) 10%, transparent);
		--z-toggle-on-bg: var(--z-toggle-accent, var(--primary));
		--z-toggle-on-color: var(--z-toggle-accent-foreground, var(--primary-foreground));
		--z-toggle-on-border: transparent;
	}

	/* off: tone-colored text (--z-toggle-color) + a dimmed tone border so the two
	   agree. on: solid tone fill with dark on-foreground text and a solid border. */
	button.is-outlined {
		--z-toggle-border: color-mix(in oklch, var(--z-toggle-accent, var(--foreground)) 50%, transparent);
		--z-toggle-hover-bg: color-mix(in oklch, var(--z-toggle-accent, var(--foreground)) 10%, transparent);
		--z-toggle-on-bg: var(--z-toggle-accent, var(--primary));
		--z-toggle-on-color: var(--z-toggle-accent-foreground, var(--primary-foreground));
		--z-toggle-on-border: var(--z-toggle-accent, var(--primary));
	}

	::slotted(svg) {
		width: var(--z-toggle-icon-size, 1rem);
		height: var(--z-toggle-icon-size, 1rem);
		flex-shrink: 0;
		pointer-events: none;
	}
`
