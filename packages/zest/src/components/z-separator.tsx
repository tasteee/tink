import { c, css, useRef, useState, useEffect } from 'atomico'

/*
 * z-separator — a hairline divider, optionally with a centered label.
 * Borders-only aesthetic: no shadows, no fills. When a `label` (or slotted
 * content) is present the rule splits around it. This is the richer sibling of
 * z-line; z-line stays the bare 1px primitive used inside dense layouts.
 */
const styles = css`
	:host {
		display: flex;
		align-items: center;
		width: 100%;
		color: var(--muted-foreground);
		gap: var(--space-base);
	}

	:host([is-vertical]) {
		flex-direction: column;
		width: auto;
		height: 100%;
	}

	:host([is-hidden]) {
		display: none;
	}

	.rule {
		flex: 1 1 auto;
		background: var(--border);
		height: 1px;
	}

	:host([is-vertical]) .rule {
		width: 1px;
		height: auto;
	}

	.label {
		flex: 0 0 auto;
		font-family: inherit;
		font-size: var(--font-size-caption);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		white-space: nowrap;
		color: var(--muted-foreground);
		line-height: 1;
		user-select: none;
	}

	/* When there's no label, collapse to a single full-width rule. */
	:host(:not([data-labeled])) .label,
	:host(:not([data-labeled])) .rule.is-trailing {
		display: none;
	}
`

export const ZSeparator = c(
	(props) => {
		const slotRef = useRef<HTMLSlotElement>()
		const [hasSlotted, setHasSlotted] = useState(false)

		useEffect(() => {
			const slot = slotRef.current
			if (!slot) return
			const update = () => setHasSlotted(slot.assignedNodes().length > 0)
			update()
			slot.addEventListener('slotchange', update)
			return () => slot.removeEventListener('slotchange', update)
		}, [])

		const isLabeled = Boolean(props.label) || hasSlotted

		return (
			<host
				shadowDom
				role='separator'
				aria-orientation={props.isVertical ? 'vertical' : 'horizontal'}
				data-labeled={isLabeled ? '' : null}
			>
				<span class='rule' aria-hidden='true'></span>
				<span class='label'>{props.label ? props.label : <slot ref={slotRef} />}</span>
				<span class='rule is-trailing' aria-hidden='true'></span>
			</host>
		)
	},
	{
		props: {
			isVertical: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true },
			label: String
		},
		styles
	}
)

customElements.define('z-separator', ZSeparator)
