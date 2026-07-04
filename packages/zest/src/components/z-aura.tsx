import { c, css } from 'atomico'

/*
 * z-aura — a rotating border-light effect that wraps any element (a button,
 * card, avatar, image) in an animated glowing frame. Two stacked conic-gradient
 * layers spin behind the slotted content: a crisp ring at the edge and a blurred
 * bloom that bleeds outward. `variant` picks the palette — the default accent
 * sweep, dual (two opposing comets), rainbow, holo, gold, silver, or glow (a
 * soft pulsing halo with no crisp ring). Size (xs → xl) scales frame thickness
 * and bloom; `--aura-color` overrides the accent and `--aura-duration` the
 * spin speed. Content keeps its own background, so only the frame shows.
 */
/*
 * NOTE: the animated `--aura-angle` is registered with @property in ink.css, at
 * the document level. @property is ignored inside a shadow-root stylesheet, so
 * without that registration `--aura-angle` has no <angle> type / initial value,
 * `var(--aura-angle)` resolves invalid, the conic-gradients fall back to nothing,
 * and the keyframe can't interpolate. Keep the registration in ink.css.
 */
const styles = css`
	:host {
		display: inline-block;
		--aura-size: 2px;
		--aura-blur: 7px;
		--aura-bloom-opacity: 0.6;
		--aura-duration: 4s;
		--aura-color: var(--neon-purple);
	}

	:host([is-hidden]) {
		display: none;
	}

	.aura {
		position: relative;
		display: inline-flex;
		border-radius: var(--aura-radius, var(--radius-lg));
		isolation: isolate;
	}

	/* Both light layers sit behind the content, spread past it by --aura-size so
	   the frame always peeks out around whatever is slotted in.

	   The 'from var(--aura-angle)' is written literally here — on the same element
	   the keyframe animates — so the spinning angle is read where it changes.
	   (Burying it inside a --aura-gradient var computed on .aura decoupled it from
	   the animation and froze the sweep at 0deg.) Variants only swap --aura-stops. */
	.ring,
	.bloom {
		position: absolute;
		inset: calc(-1 * var(--aura-size));
		border-radius: inherit;
		background: conic-gradient(from var(--aura-angle), var(--aura-stops));
		animation: aura-spin var(--aura-duration) linear infinite;
		z-index: -1;
		pointer-events: none;
	}

	.bloom {
		inset: calc(-2 * var(--aura-size));
		filter: blur(var(--aura-blur));
		opacity: var(--aura-bloom-opacity);
	}

	.content {
		position: relative;
		display: inline-flex;
		border-radius: inherit;
		z-index: 0;
	}

	/* ── palettes: each sets --aura-stops (the conic color-stop list) ────────── */

	/* default accent — a comet: a long transparent gap, a tail that builds from
	   dim to full, then a hot white-tipped head, cut hard back to transparent.
	   As --aura-angle sweeps, that bright head leads the wisp around the frame. */
	.aura {
		--aura-stops:
			transparent 0deg,
			transparent 205deg,
			color-mix(in oklch, var(--aura-color) 30%, transparent) 315deg,
			var(--aura-color) 350deg,
			color-mix(in oklch, white 45%, var(--aura-color)) 358deg,
			transparent 360deg;
	}

	/* dual — two comet heads chasing each other 180° apart */
	.aura.is-dual {
		--aura-stops:
			transparent 0deg,
			var(--aura-color) 18deg,
			color-mix(in oklch, white 40%, var(--aura-color)) 20deg,
			transparent 55deg,
			transparent 180deg,
			var(--aura-color) 198deg,
			color-mix(in oklch, white 40%, var(--aura-color)) 200deg,
			transparent 235deg,
			transparent 360deg;
	}

	.aura.is-rainbow {
		--aura-stops:
			oklch(0.72 0.2 20),
			oklch(0.78 0.18 90),
			oklch(0.82 0.2 145),
			oklch(0.75 0.18 220),
			oklch(0.7 0.22 300),
			oklch(0.72 0.2 20);
	}

	.aura.is-holo {
		--aura-stops:
			oklch(0.85 0.11 320),
			oklch(0.88 0.1 200),
			oklch(0.9 0.09 150),
			oklch(0.86 0.11 60),
			oklch(0.85 0.11 320);
	}

	.aura.is-gold {
		--aura-stops:
			oklch(0.65 0.12 85),
			oklch(0.88 0.15 95),
			oklch(0.98 0.05 100),
			oklch(0.88 0.15 95),
			oklch(0.65 0.12 85);
	}

	.aura.is-silver {
		--aura-stops:
			oklch(0.6 0 0),
			oklch(0.85 0 0),
			oklch(0.98 0 0),
			oklch(0.85 0 0),
			oklch(0.6 0 0);
	}

	/* glow — no crisp ring, just a soft breathing halo */
	.aura.is-glow {
		--aura-blur: 14px;
		--aura-bloom-opacity: 0.85;
	}
	.aura.is-glow .ring {
		display: none;
	}
	.aura.is-glow .bloom {
		background: radial-gradient(closest-side, var(--aura-color), transparent);
		animation: aura-pulse calc(var(--aura-duration) * 0.6) ease-in-out infinite;
	}

	/* sizes scale frame thickness + bloom spread */
	.aura.is-xs {
		--aura-size: 1px;
		--aura-blur: 4px;
	}
	.aura.is-sm {
		--aura-size: 1.5px;
		--aura-blur: 5px;
	}
	.aura.is-md {
		--aura-size: 2px;
		--aura-blur: 7px;
	}
	.aura.is-lg {
		--aura-size: 3px;
		--aura-blur: 11px;
	}
	.aura.is-xl {
		--aura-size: 4px;
		--aura-blur: 16px;
	}

	@keyframes aura-spin {
		to {
			--aura-angle: 360deg;
		}
	}

	@keyframes aura-pulse {
		0%,
		100% {
			opacity: calc(var(--aura-bloom-opacity) * 0.5);
			transform: scale(0.97);
		}
		50% {
			opacity: var(--aura-bloom-opacity);
			transform: scale(1.03);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ring,
		.bloom {
			animation: none;
		}
	}
`

const resolveVariantClass = (props: any): string => {
	if (props.variant === 'dual') return 'is-dual'
	if (props.variant === 'rainbow') return 'is-rainbow'
	if (props.variant === 'holo') return 'is-holo'
	if (props.variant === 'gold') return 'is-gold'
	if (props.variant === 'silver') return 'is-silver'
	if (props.variant === 'glow') return 'is-glow'
	return 'is-default'
}

const resolveSizeClass = (props: any): string => {
	if (props.size === 'xs') return 'is-xs'
	if (props.size === 'sm') return 'is-sm'
	if (props.size === 'lg') return 'is-lg'
	if (props.size === 'xl') return 'is-xl'
	return 'is-md'
}

export const ZAura = c(
	(props) => {
		const auraClass = ['aura', resolveVariantClass(props), resolveSizeClass(props)].join(' ')

		return (
			<host shadowDom>
				<div class={auraClass}>
					<span class="ring" aria-hidden="true"></span>
					<span class="bloom" aria-hidden="true"></span>
					<div class="content">
						<slot />
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			variant: { type: String, reflect: true },
			size: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-aura', ZAura)
