import { c, css, useRef, useState } from 'atomico'

/*
 * z-avatar-stack — overlaps slotted z-avatar children into a single cluster,
 * capping how many render (`max`) and summarizing the rest as a "+N" badge.
 * `total` overrides the overflow count for cases where not every avatar is in
 * the DOM (e.g. "+241" for a big roster). Overlap direction follows slot
 * order — later avatars paint over earlier ones, no z-index bookkeeping
 * needed since that's just normal DOM paint order.
 */
const styles = css`
	:host {
		display: inline-flex;
		align-items: center;
		--size: 2.5rem;
		--overlap: 0.7rem;
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([size='xs']) {
		--size: 1.5rem;
		--overlap: 0.45rem;
	}
	:host([size='small']) {
		--size: 2rem;
		--overlap: 0.55rem;
	}
	:host([size='large']) {
		--size: 3.25rem;
		--overlap: 0.9rem;
	}
	:host([size='xl']) {
		--size: 4rem;
		--overlap: 1.1rem;
	}

	::slotted(z-avatar) {
		outline: 3px solid var(--stack-ring, var(--background));
		border-radius: 999px;
		margin-left: calc(-1 * var(--overlap));
		transition: transform 0.12s ease;
	}

	::slotted(z-avatar:first-child) {
		margin-left: 0;
	}

	::slotted(z-avatar:hover) {
		transform: translateY(-0.15rem);
	}

	.overflow {
		box-sizing: border-box;
		width: var(--size);
		height: var(--size);
		border-radius: 999px;
		margin-left: calc(-1 * var(--overlap));
		outline: 3px solid var(--stack-ring, var(--background));
		background: var(--color-neutral-3);
		color: var(--muted-foreground);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: inherit;
		font-weight: 600;
		font-size: calc(var(--size) * 0.34);
		line-height: 1;
		user-select: none;
	}
`

export const ZAvatarStack = c(
	(props) => {
		const slotRef = useRef<HTMLSlotElement>()
		const [count, setCount] = useState(0)
		const max = props.max || 0

		const handleSlotChange = () => {
			const slot = slotRef.current as any
			if (!slot) return
			const elements: Element[] = slot.assignedElements()
			setCount(elements.length)
			elements.forEach((el, index) => {
				;(el as HTMLElement).style.display = max > 0 && index >= max ? 'none' : ''
			})
		}

		const overflowCount = props.total ? Math.max(0, props.total - Math.min(max || count, count)) : max > 0 ? Math.max(0, count - max) : 0

		return (
			<host shadowDom>
				<slot ref={slotRef} onslotchange={handleSlotChange} />
				{overflowCount > 0 && <span class="overflow">+{overflowCount}</span>}
			</host>
		)
	},
	{
		props: {
			max: Number,
			total: Number,
			size: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-avatar-stack', ZAvatarStack)
