import { defineElement } from '../shared/define-element'
import { c, css, useEffect, useRef } from 'atomico'
import { coerceSize, sizeProp } from '../shared/layout-schema'

/*
 * z-marquee, an infinite auto-scrolling row (or column) over slotted content.
 * Seamless looping needs two equal-width copies running the same animation in
 * lockstep (copy B sits exactly one width+gap to the right of copy A, so when
 * both slide left by that same distance the loop restarts invisibly). Shadow
 * DOM can only assign a given light-DOM node to one slot, so the second copy
 * can't be a second <slot>, it is rebuilt from deep DOM clones of the first
 * copy after slot changes and component renders. Atomico owns the empty clone
 * group while the component owns its children, avoiding reconciliation against
 * serialized `innerHTML`. JS-only state still copies when the underlying node
 * supports `cloneNode`; event listeners do not, which is fine because the
 * duplicated half is inert and hidden from assistive technology.
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

	:host([has-fade][direction='vertical']) .viewport {
		mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
		-webkit-mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
	}

	.track {
		display: flex;
		width: max-content;
		gap: var(--gap);
	}

	:host([direction='vertical']) .track {
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

	:host([direction='vertical']) .group {
		flex-direction: column;
		animation-name: marquee-y;
	}

	:host([is-reversed]) .group {
		animation-direction: reverse;
	}

	:host([does-pause-on-hover]:hover) .group,
	:host([does-pause-on-hover]:focus-within) .group {
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
		const cloneRef = useRef<HTMLDivElement>()

		const syncClone = () => {
			const slot = slotRef.current as any
			const clone = cloneRef.current
			if (!slot || !clone) return
			const elements: Element[] = slot.assignedElements()
			clone.replaceChildren(...elements.map((element) => element.cloneNode(true)))
		}

		// Atomico owns the group element but deliberately not its cloned children.
		// Refresh after every render in case reconciliation cleared the imperative
		// copy while applying a duration, gap, direction, or pause-state update.
		useEffect(() => syncClone())

		const hostStyle: Record<string, string> = {}
		if (props.duration) hostStyle['--duration'] = `${props.duration}s`
		const gap = coerceSize((props as any).gap)
		if (gap) hostStyle['--gap'] = gap

		return (
			<host shadowDom style={hostStyle}>
				<div class="viewport">
					<div class="track">
						<div class="group">
							<slot ref={slotRef} onslotchange={syncClone} />
						</div>
						<div ref={cloneRef} class="group" aria-hidden="true" inert></div>
					</div>
				</div>
			</host>
		)
	},
	{
		props: {
			duration: Number,
			gap: sizeProp,
			isReversed: { type: Boolean, reflect: true },
			direction: { type: String, reflect: true },
			doesPauseOnHover: { type: Boolean, reflect: true },
			hasFade: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

defineElement('z-marquee', ZMarquee)
