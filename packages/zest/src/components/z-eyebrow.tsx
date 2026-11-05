import { defineElement } from '../shared/define-element'
import { c, css } from 'atomico'
import { oneOf } from '../shared/prop-types'

/*
 * z-eyebrow, the small mono kicker that sits above a page or section title
 * ("DESIGN SYSTEM ─────"). Uppercase, letter-tracked, drawn in an accent tone
 * (secondary/pink by default), with an optional trailing hairline rule via
 * `has-rule`. Label comes from the `label` prop or the default slot. Owns no
 * outer margin, space it with the surrounding layout primitive.
 */
const styles = css`
	:host {
		display: inline-flex;
		align-items: center;
		gap: 1rem;
		--eyebrow-tone: var(--pink);
	}

	:host([is-hidden]) {
		display: none;
	}

	:host([tone='primary']) {
		--eyebrow-tone: var(--purple);
	}
	:host([tone='neutral']) {
		--eyebrow-tone: var(--muted-foreground);
	}

	/* Full-width lets the trailing rule stretch to the edge instead of a fixed 5rem. */
	:host([is-full-width]) {
		display: flex;
		width: 100%;
		min-width: 0;
	}

	.label {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 500;
		line-height: 1;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		white-space: nowrap;
		color: var(--eyebrow-tone);
	}

	.rule {
		min-width: 0;
		flex-shrink: 0;
		width: var(--eyebrow-rule-width, 5rem);
		height: 1px;
		background: var(--border);
	}

	:host([is-full-width]) .rule {
		flex: 1 1 auto;
		width: auto;
	}
`

export const ZEyebrow = c(
	(props) => (
		<host shadowDom>
			<span class='label'>{props.label ? props.label : <slot />}</span>
			{props.hasRule && <span class='rule' aria-hidden='true'></span>}
		</host>
	),
	{
		props: {
			tone: { type: oneOf('neutral', 'primary', 'secondary'), reflect: true },
			label: String,
			hasRule: { type: Boolean, reflect: true },
			isFullWidth: { type: Boolean, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

defineElement('z-eyebrow', ZEyebrow)
