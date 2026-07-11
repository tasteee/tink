import { c, css, useRef, useState } from 'atomico'
import { coerceSize, sizeProp } from '../shared/layout-schema'

/*
 * z-marquee — an infinite auto-scrolling row (or column) over slotted content.
 * Seamless looping needs two equal-width copies running the same animation in
 * lockstep (copy B sits exactly one width+gap to the right of copy A, so when
 * both slide left by that same distance the loop restarts invisibly). Shadow
 * DOM can only assign a given light-DOM node to one slot, so the second copy
 * can't be a second <slot> — it's rebuilt from a serialized HTML string of the
 * first copy and handed to the vdom via the `innerHTML` prop (recomputed on
 * every `slotchange`). That's also why it's vdom-safe: an imperatively
 * `appendChild`-ed clone gets wiped the next time this component re-renders
 * (see atomico-innerhtml-rerender-gotcha) — routing it through `innerHTML` on
 * a real JSX node means Atomico owns and preserves it. The one tradeoff: any
 * child prop set only as a JS property (not reflected to an attribute — e.g.
 * z-avatar's `name`/`src`) won't survive into the cloned half, since string
 * serialization only sees attributes. Prefer attribute-driven content here.
 */
const styles = css`
	:host {
		display: block;
		overflow: hidden;
		--duration: 40s;
		--gap: var(--spacing-6);
	}

	:host([is-hidden]) {
		display: none;
	}

	.viewport {
		overflow: hidden;
	}

	:host([has-fade]) .viewport {
		mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
		-webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
	}

	:host([has-fade][vertical]) .viewport {
		mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
		-webkit-mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
	}

	.track {
		display: flex;
		width: max-content;
		gap: var(--gap);
	}

	:host([vertical]) .track {
		flex-direction: column;
		width: auto;
		height: max-content;
	}

	.group {
		display: flex;
		flex-shrink: 0;
		gap: var(--gap);
		animation: marquee-x var(--duration) linear infinite;
	}

	:host([vertical]) .group {
		flex-direction: column;
		animation-name: marquee-y;
	}

	:host([reverse]) .group {
		animation-direction: reverse;
	}

	:host([pause-on-hover]:hover) .group,
	:host([pause-on-hover]:focus-within) .group {
		animation-play-state: paused;
	}

	@keyframes marquee-x {
		to {
			transform: translateX(calc(-100% - var(--gap)));
		}
	}

	@keyframes marquee-y {
		to {
			transform: translateY(calc(-100% - var(--gap)));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.group {
			animation: none;
		}
	}
`

export const ZMarquee = c(
	(props) => {
		const slotRef = useRef<HTMLSlotElement>()
		const [cloneHtml, setCloneHtml] = useState('')

		const handleSlotChange = () => {
			const slot = slotRef.current as any
			if (!slot) return
			const elements: Element[] = slot.assignedElements()
			setCloneHtml(elements.map((el) => el.outerHTML).join(''))
		}

		const hostStyle: Record<string, string> = {}
		if (props.duration) hostStyle['--duration'] = `${props.duration}s`
		const gap = coerceSize((props as any).gap)
		if (gap) hostStyle['--gap'] = gap

		return (
			<host shadowDom style={hostStyle}>
				<div class="viewport">
					<div class="track">
						<div class="group">
							<slot ref={slotRef} onslotchange={handleSlotChange} />
						</div>
						<div class="group" aria-hidden="true" inert innerHTML={cloneHtml}></div>
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			duration: Number,
			gap: sizeProp,
			reverse: { type: Boolean, reflect: true },
			vertical: { type: Boolean, reflect: true },
			pauseOnHover: { type: Boolean, reflect: true },
			hasFade: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-marquee', ZMarquee)
