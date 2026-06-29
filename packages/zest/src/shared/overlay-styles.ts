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
 *    z-alert-dialog — centered panel, dimmed backdrop, same border language.
 *
 * Both deliberately keep the "borders over shadows" rule: depth reads through a
 * hairline border and a backdrop, never a drop shadow.
 */

export const floatingSurfaceStyles = css`
	:host {
		/* the host hugs its trigger and acts as the positioning anchor — it must
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
	.surface {
		right: auto;
		bottom: auto;
		opacity: 0;
		transform: translateY(2px);
		transition:
			opacity 0.12s ease,
			transform 0.12s ease;
	}

	.surface:popover-open,
	.surface.is-open {
		opacity: 1;
		transform: translateY(0);
	}

	.surface[data-side='top'] {
		transform: translateY(-2px);
	}
	.surface[data-side='top']:popover-open,
	.surface[data-side='top'].is-open {
		transform: translateY(0);
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

	.dialog::backdrop {
		background: color-mix(in oklch, var(--background) 55%, transparent);
		backdrop-filter: blur(3px);
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
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: var(--space-lg);
		overflow-y: auto;
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
			color 0.12s ease,
			background-color 0.12s ease;
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
