import { css } from 'atomico'

/**
 * Shared accessibility overrides, included inside each core shadow root.
 *
 * Reduced motion: an instant change, not a slower one. Every animation and
 * transition in the shadow root collapses to a hair over zero, which keeps
 * `transitionend` firing for the code that waits on it.
 *
 * Forced colors (Windows High Contrast): the platform repaints colours for
 * us, and takes away the ones a state depended on. Three things need saying
 * explicitly — that a selected / checked / active thing is the system
 * Highlight, that a disabled thing is GrayText, and that focus is a solid
 * system-coloured outline rather than a translucent ring. The class and
 * ARIA hooks below are the ones the core set uses for those states.
 */
export const interactionStyles = css`
	@media (prefers-reduced-motion: reduce) {
		*, *::before, *::after {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
			scroll-behavior: auto !important;
		}
	}

	@media (forced-colors: active) {
		:host(:focus-visible),
		:focus-visible,
		:focus-visible + .box,
		:focus-visible + .ring,
		:focus-visible + .track,
		.field:focus-within {
			outline: 2px solid Highlight !important;
			outline-offset: 2px;
		}

		.is-checked,
		.is-on,
		.is-active,
		.is-selected,
		[aria-selected='true'],
		[aria-current] {
			forced-color-adjust: none;
			background: Highlight !important;
			border-color: Highlight !important;
			color: HighlightText !important;
		}

		.is-checked *,
		.is-on *,
		.is-active *,
		.is-selected *,
		[aria-selected='true'] * {
			color: HighlightText !important;
			stroke: HighlightText;
		}

		.is-disabled,
		:disabled,
		[aria-disabled='true'] {
			color: GrayText !important;
			border-color: GrayText !important;
			opacity: 1;
		}

		.field,
		.trigger,
		.panel,
		.surface,
		.box,
		.ring,
		.track,
		button {
			border-color: CanvasText;
		}
	}
`
