import { c, css } from 'atomico'

/*
 * z-chassis — a device-like application chassis. The outer body (bezel + rail)
 * is a lighter surface, like the shell of a device; the main content sits in a
 * darker, inset "screen" with its own border — the display where a routed view
 * renders. Compose it with any rail content and any screen content:
 *
 *   <z-chassis rail-width="14rem" expand-on-hover>
 *     <div slot="sidebar">…logo + nav rows…</div>
 *     <div slot="sidebar-footer">…avatar…</div>
 *     …main / routed content (the screen)…
 *   </z-chassis>
 *
 * Slots: `sidebar` (rail, top-aligned) · `sidebar-footer` (rail, bottom) ·
 * default (the screen). `rail-side="right"` flips the rail to the right.
 *
 * `expand-on-hover` collapses the rail to a slim width and expands it on
 * hovering the rail itself (not the whole chassis), with a fluid, premium
 * easing. Tune with `rail-width` (expanded) + `rail-collapsed-width`, or the
 * --chassis-duration / --chassis-ease tokens. While collapsed, slotted nav
 * labels can key off the inherited --chassis-label-opacity custom property
 * (0 collapsed, 1 expanded) to hide themselves. Retheme via --chassis-body /
 * --chassis-screen / --chassis-border / --chassis-radius / --chassis-rail-width /
 * --chassis-bezel (frame around the rail) / --chassis-frame (thinner frame
 * around the screen's other three edges).
 */
const styles = css`
	:host {
		display: flex;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		gap: var(--chassis-bezel, 0.75rem);
		padding-top: var(--chassis-frame, 0.375rem);
		padding-right: var(--chassis-frame, 0.375rem);
		padding-bottom: var(--chassis-frame, 0.375rem);
		padding-left: var(--chassis-bezel, 0.75rem);
		background: var(--chassis-body, var(--paper));
		border: 1px solid var(--chassis-border, var(--color-neutral-3));
		border-radius: var(--chassis-radius, var(--radius-xl));
		color: var(--foreground);
	}
	:host([rail-side='right']) {
		flex-direction: row-reverse;
		padding-left: var(--chassis-frame, 0.375rem);
		padding-right: var(--chassis-bezel, 0.75rem);
	}
	:host([is-hidden]) {
		display: none;
	}

	/* the rail is part of the lighter body — no surface of its own */
	.rail {
		flex: 0 0 var(--chassis-rail-width, 4.25rem);
		width: var(--chassis-rail-width, 4.25rem);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-height: 0;
		box-sizing: border-box;
		padding: 0.125rem;
		overflow: hidden;
		/* the fluid part: expand/collapse the rail — and, via flex, the screen —
		   on a long premium easing (easeOutQuint). */
		transition:
			flex-basis var(--chassis-duration, 420ms) var(--chassis-ease, cubic-bezier(0.22, 1, 0.36, 1)),
			width var(--chassis-duration, 420ms) var(--chassis-ease, cubic-bezier(0.22, 1, 0.36, 1));
	}
	:host([expand-on-hover]) .rail {
		flex-basis: var(--chassis-rail-collapsed, 3.5rem);
		width: var(--chassis-rail-collapsed, 3.5rem);
		--chassis-label-opacity: 0;
	}
	:host([expand-on-hover]) .rail:hover,
	:host([expand-on-hover]) .rail:focus-within {
		flex-basis: var(--chassis-rail-width, 4.25rem);
		width: var(--chassis-rail-width, 4.25rem);
		--chassis-label-opacity: 1;
	}

	.rail-main {
		flex: 1 1 auto;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
		min-height: 0;
		padding-top: 8px;
		overflow-y: auto;
		overflow-x: hidden;
	}
	.rail-foot {
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
		padding-bottom: 8px;
		overflow: hidden;
	}

	/* the screen — the darker, inset display */
	.screen {
		flex: 1 1 auto;
		min-width: 0;
		min-height: 0;
		overflow: auto;
		position: relative;
		background: var(--chassis-screen, var(--bg));
		border: 1px solid var(--chassis-screen-border, var(--border));
		border-radius: var(--chassis-screen-radius, var(--radius-lg));
	}
	.screen::-webkit-scrollbar {
		width: 10px;
		height: 10px;
	}
	.screen::-webkit-scrollbar-track {
		background: transparent;
	}
	.screen::-webkit-scrollbar-thumb {
		background: var(--color-neutral-3);
		border: 2px solid transparent;
		border-radius: 999px;
		background-clip: padding-box;
	}
	.screen::-webkit-scrollbar-thumb:hover {
		background: var(--color-neutral-4);
		background-clip: padding-box;
	}

	@media (prefers-reduced-motion: reduce) {
		.rail {
			transition: none;
		}
	}
`

export const ZChassis = c(
	(props) => {
		const style: Record<string, string> = {}
		if (props.railWidth) style['--chassis-rail-width'] = props.railWidth as string
		if (props.railCollapsedWidth) style['--chassis-rail-collapsed'] = props.railCollapsedWidth as string
		if (props.bezel) style['--chassis-bezel'] = props.bezel as string
		if (props.frame) style['--chassis-frame'] = props.frame as string

		return (
			<host shadowDom style={style}>
				<div class="rail" part="rail">
					<div class="rail-main">
						<slot name="sidebar" />
					</div>
					<div class="rail-foot">
						<slot name="sidebar-footer" />
					</div>
				</div>
				<div class="screen" part="screen">
					<slot />
				</div>
			</host>
		)
	},
	{
		props: {
			railWidth: { type: String, reflect: true },
			railCollapsedWidth: { type: String, reflect: true },
			bezel: { type: String, reflect: true },
			frame: { type: String, reflect: true },
			railSide: { type: String, reflect: true },
			expandOnHover: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-chassis', ZChassis)
