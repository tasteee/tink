import { defineElement } from '../shared/define-element'
import { c, css, useRef, useState, useEffect } from 'atomico'

/*
 * z-separator, the divider. A hairline rule, optionally with a centred label,
 * and optionally vertical. Borders-only aesthetic: no shadows, no fills. When a
 * label (or slotted content) is present the rule splits around it.
 *
 * This absorbed z-line, which was the same rule with no label and a `is-vertical`
 * flag. Two elements for one concept meant every divider was a coin toss, and
 * the unlabelled horizontal case, the common one, rendered identically from
 * either. The label is what is optional here, not the element.
 *
 * `is-vertical` is unlabelled by design: a rule dividing two clusters in a row has
 * no room for a caption, and rotating one reads as a mistake. A label set
 * alongside `is-vertical` is ignored rather than drawn sideways.
 */
const styles = css`
	:host {
		display: flex;
		align-items: center;
		width: 100%;
		color: var(--muted-foreground);
		gap: var(--space-base);
	}

	:host([is-hidden]) {
		display: none;
	}

	/* Vertical carries no label, so the host collapses to the rule itself
	   rather than a flex line with something to split around. It needs a parent
	   with a resolvable height — in a flex row with stretched items it fills
	   naturally, in a block container it collapses to nothing. */
	:host([is-vertical]) {
		display: block;
		flex-shrink: 0;
		align-self: stretch;
		width: 1px;
		height: auto;
		background: var(--border);
	}

	.rule {
		flex: 1 1 auto;
		background: var(--border);
		height: 1px;
	}

	:host([is-vertical]) .rule,
	:host([is-vertical]) .label {
		display: none;
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

		const isLabeled = !props.isVertical && (Boolean(props.label) || hasSlotted)
		const ariaOrientation = props.isVertical ? 'vertical' : 'horizontal'

		return (
			<host
				shadowDom
				role='separator'
				aria-orientation={ariaOrientation}
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
			isHidden: { type: Boolean, reflect: true },
			isVertical: { type: Boolean, reflect: true },
			label: String
		},
		styles
	}
)

defineElement('z-separator', ZSeparator)
