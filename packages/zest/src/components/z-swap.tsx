import { c, css, event, useProp } from 'atomico'

/*
 * z-swap — toggles between two faces (an "on" and an "off" state). Drive it by
 * clicking (it owns a hidden checkbox) or control it externally with `is-active`.
 * Put the two faces in the `on` and `off` slots — typically a pair of icons
 * (play/pause, sun/moon, menu/close) or ON/OFF text. Emits `change` with
 * { active } on every toggle.
 *
 * `kind` picks the layout:
 *   - stack (default): both faces overlap in one footprint and crossfade.
 *   - beside: the faces sit next to each other, each holding its own space.
 * `effect` picks the transition: fade (default), rotate, or flip.
 *
 * `has-ghost` (beside only) keeps the inactive face on-screen as a faint
 * grayscale silhouette instead of hiding it — so the layout doesn't feel
 * lopsided when only one face is lit. The silhouette is a translucent grey over
 * whatever background the component sits on, so it always reads a step or two off
 * that background without needing to know the colour. Tune with
 * `--swap-ghost-opacity`.
 */
const styles = css`
	:host {
		display: inline-flex;
		--swap-duration: 0.2s;
		--swap-gap: 0.5rem;
		--swap-ghost-opacity: 0.2;
	}

	:host([is-hidden]) {
		display: none;
	}

	label {
		position: relative;
		display: inline-flex;
		align-items: center;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
	}

	label.is-disabled {
		opacity: 0.5;
		pointer-events: none;
	}

	input {
		position: absolute;
		width: 0;
		height: 0;
		opacity: 0;
		margin: 0;
	}

	.face {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition:
			opacity var(--swap-duration) ease,
			transform var(--swap-duration) ease,
			filter var(--swap-duration) ease;
	}

	/* ── stack: both faces overlap in one cell, only one shown at a time ──────── */
	.swap.is-stack {
		display: inline-grid;
		place-items: center;
	}
	.swap.is-stack .face {
		grid-area: 1 / 1;
	}

	/* ── beside: faces sit next to each other, each keeping its own space ─────── */
	.swap.is-beside {
		display: inline-flex;
		align-items: center;
		gap: var(--swap-gap);
	}

	/* ── fade (default) ──────────────────────────────────────────────────────── */
	.on {
		opacity: 0;
	}
	.off {
		opacity: 1;
	}
	.is-active .on {
		opacity: 1;
	}
	.is-active .off {
		opacity: 0;
	}

	/* ── ghost: inactive face lingers as a faint grey silhouette (beside only) ── */
	.swap.is-beside.has-ghost .off {
		opacity: 1;
		filter: none;
	}
	.swap.is-beside.has-ghost .on {
		opacity: var(--swap-ghost-opacity);
		filter: grayscale(1);
	}
	.swap.is-beside.has-ghost.is-active .off {
		opacity: var(--swap-ghost-opacity);
		filter: grayscale(1);
	}
	.swap.is-beside.has-ghost.is-active .on {
		opacity: 1;
		filter: none;
	}

	/* ── rotate ──────────────────────────────────────────────────────────────── */
	.is-rotate .on {
		transform: rotate(-45deg);
	}
	.is-rotate .off {
		transform: rotate(0deg);
	}
	.is-rotate.is-active .on {
		transform: rotate(0deg);
	}
	.is-rotate.is-active .off {
		transform: rotate(45deg);
	}

	/* ── flip (3D) ───────────────────────────────────────────────────────────── */
	.is-flip {
		transform-style: preserve-3d;
		perspective: 1000px;
	}
	.is-flip .face {
		backface-visibility: hidden;
		transition: transform var(--swap-duration) ease;
	}
	.is-flip .on {
		transform: rotateY(180deg);
		opacity: 1;
	}
	.is-flip .off {
		transform: rotateY(0deg);
		opacity: 1;
	}
	.is-flip.is-active .on {
		transform: rotateY(360deg);
	}
	.is-flip.is-active .off {
		transform: rotateY(180deg);
	}

	input:focus-visible + .swap {
		outline: 3px solid color-mix(in oklch, var(--ring) 50%, transparent);
		outline-offset: 3px;
		border-radius: var(--radius-sm);
	}

	::slotted(svg) {
		width: 1.25rem;
		height: 1.25rem;
	}
`

const resolveKindClass = (props: any): string => {
	if (props.kind === 'beside') return 'is-beside'
	return 'is-stack'
}

const resolveEffectClass = (props: any): string => {
	if (props.effect === 'rotate') return 'is-rotate'
	if (props.effect === 'flip') return 'is-flip'
	return 'is-fade'
}

export const ZSwap = c(
	(props) => {
		const [isActive, setIsActive] = useProp<boolean>('isActive')

		const labelClass = ['label'].concat(props.isDisabled ? ['is-disabled'] : []).join(' ')
		const swapClass = ['swap', resolveKindClass(props), resolveEffectClass(props)]
			.concat(props.hasGhost ? ['has-ghost'] : [])
			.concat(isActive ? ['is-active'] : [])
			.join(' ')

		return (
			<host shadowDom>
				<label class={labelClass}>
					<input
						type="checkbox"
						checked={isActive}
						disabled={props.isDisabled}
						aria-label={props.label}
						onchange={() => {
							const next = !isActive
							setIsActive(next)
							props.change({ active: next })
						}}
					/>
					<span class={swapClass} aria-hidden="true">
						<span class="face off">
							<slot name="off" />
						</span>
						<span class="face on">
							<slot name="on" />
						</span>
					</span>
				</label>
			</host>
		)
	},
	{
		props: {
			kind: { type: String, reflect: true },
			effect: { type: String, reflect: true },
			hasGhost: { type: Boolean, reflect: true },
			isActive: { type: Boolean, reflect: true },
			isDisabled: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			label: String,
			change: event<{ active: boolean }>({ bubbles: true, composed: true })
		},
		styles
	}
)

customElements.define('z-swap', ZSwap)
