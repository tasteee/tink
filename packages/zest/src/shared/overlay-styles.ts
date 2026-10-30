import { css } from 'atomico'

/*
 * Shared chrome for floating overlays. Two reusable sheets:
 *
 *  - floatingSurfaceStyles: the bordered, shadow-free panel used by
 *    z-popover and z-hover-card. Lives in the top layer via [popover], is
 *    fixed-positioned (coords come from shared/overlay.ts), and fades/rises in
 *    with a short, side-aware transition.
 *
 *  - dialogSurfaceStyles: the modal <dialog> chrome shared by z-dialog and
 *    z-alert-dialog, centered panel, dimmed backdrop, same border language.
 *
 * Both deliberately keep the "borders over shadows" rule: depth reads through a
 * hairline border and a backdrop, never a drop shadow.
 */

export const floatingSurfaceStyles = css`
	:host {
		/* the host hugs its trigger and acts as the positioning anchor, it must
		   have a box (not display:contents) so getBoundingClientRect is real. */
		display: inline-flex;
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

	.surface {
		position: fixed;
		left: 0;
		top: 0;
		/* override the UA [popover] { margin: auto } that would re-center it */
		margin: 0;
		z-index: 50;
		box-sizing: border-box;
		background: var(--popover);
		color: var(--popover-foreground);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: var(--z-overlay-padding, 1rem);
		max-width: var(--z-overlay-max-width, 20rem);
		font-size: var(--font-size-small);
		line-height: var(--line-height-body);
		overflow: visible;
	}

	/* [popover] elements get a UA inset that would re-center them; we position
	   via inline left/top from shared/overlay.ts, so clear right/bottom only. */
	/* Motion: hidden at rest, data-state="open" (shared/overlay.ts) fades,
	   rises, and scales in from the anchored side; exit retraces it faster. */
	.surface {
		right: auto;
		bottom: auto;
		--travel: calc(var(--motion-distance-sm) * var(--motion-travel));
		opacity: 0;
		scale: var(--motion-scale-from);
		translate: 0 var(--travel);
		transition:
			opacity var(--motion-exit-fast) var(--ease-exit),
			scale var(--motion-exit-fast) var(--ease-exit),
			translate var(--motion-exit-fast) var(--ease-exit);
	}

	.surface[data-side='top'] {
		translate: 0 calc(var(--travel) * -1);
		transform-origin: bottom center;
	}
	.surface[data-side='bottom'] {
		transform-origin: top center;
	}
	.surface[data-side='left'] {
		translate: calc(var(--travel) * -1) 0;
		transform-origin: right center;
	}
	.surface[data-side='right'] {
		translate: var(--travel) 0;
		transform-origin: left center;
	}

	.surface[data-state='open'],
	.surface.is-open {
		opacity: 1;
		scale: 1;
		translate: 0 0;
		transition:
			opacity var(--motion-fast) var(--ease-enter),
			scale var(--motion-fast) var(--ease-enter),
			translate var(--motion-fast) var(--ease-enter);
	}
`

export const dialogSurfaceStyles = css`
	:host {
		display: contents;
		--accent: var(--primary);
	}

	:host([tone='primary']) {
		--accent: var(--purple);
	}

	:host([tone='secondary']) {
		--accent: var(--pink);
	}

	:host([tone='danger']) {
		--accent: var(--destructive);
	}

	.dialog {
		box-sizing: border-box;
		width: min(var(--z-dialog-width, 30rem), calc(100vw - 2rem));
		max-height: calc(100vh - 4rem);
		padding: 0;
		background: var(--color-neutral-2);
		color: var(--popover-foreground);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	/* Motion (shared/modal.ts drives data-state). The resting, un-flagged state
	   is the hidden one: entry rises + scales in, exit retraces the same path
	   faster with an accelerating curve. Sheet and drawer swap the travel for
	   an edge slide but keep the timings. */
	.dialog {
		opacity: 0;
		scale: var(--motion-scale-from);
		translate: 0 calc(var(--motion-distance-md) * var(--motion-travel));
		transition:
			opacity var(--motion-exit-base) var(--ease-exit),
			scale var(--motion-exit-base) var(--ease-exit),
			translate var(--motion-exit-base) var(--ease-exit);
	}

	.dialog[data-state='open'] {
		opacity: 1;
		scale: 1;
		translate: 0 0;
		transition:
			opacity var(--motion-base) var(--ease-enter),
			scale var(--motion-base) var(--ease-enter),
			translate var(--motion-base) var(--ease-enter);
	}

	.dialog::backdrop {
		background: color-mix(in oklch, var(--background) 55%, transparent);
		backdrop-filter: blur(3px);
		opacity: 0;
		transition: opacity var(--motion-exit-base) var(--ease-exit);
	}

	.dialog[data-state='open']::backdrop {
		opacity: 1;
		transition: opacity var(--motion-base) var(--ease-enter);
	}

	.dialog[open] {
		display: flex;
		flex-direction: column;
		box-shadow:
			0 1px 1px color-mix(in oklch, black 28%, transparent),
			0 6px 14px -8px color-mix(in oklch, black 42%, transparent),
			0 28px 64px -36px color-mix(in oklch, black 48%, transparent),
			0 72px 180px -112px color-mix(in oklch, var(--accent) 20%, transparent);
	}

	.body {
		/* Keep wheel and touch scrolling inside the modal when this is the active
		   scroll surface, rather than handing it off to the document at either end. */
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: var(--space-lg);
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.title {
		margin: 0;
		font-size: var(--font-size-h4);
		font-weight: 600;
		line-height: var(--line-height-h4);
		color: var(--foreground);
	}

	.description {
		margin: 0;
		color: var(--muted-foreground);
		font-size: var(--font-size-small);
		line-height: var(--line-height-body);
	}

	.close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		flex-shrink: 0;
		margin: -0.25rem -0.25rem 0 0;
		background: transparent;
		border: 0;
		border-radius: var(--radius-sm);
		color: var(--muted-foreground);
		cursor: pointer;
		transition:
			color var(--motion-fast) var(--ease-enter),
			background-color var(--motion-fast) var(--ease-enter);
	}

	.close:hover {
		color: var(--foreground);
		background: color-mix(in oklch, var(--foreground) 8%, transparent);
	}

	.close:focus-visible {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 2px;
	}

	.close svg {
		width: 1rem;
		height: 1rem;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		fill: none;
	}

	.footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.625rem;
		padding: var(--space-md) var(--space-lg) var(--space-lg);
	}

	::slotted([slot='footer']) {
		display: flex;
		gap: 0.625rem;
	}
`
