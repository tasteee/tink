import { c, css } from 'atomico'

/*
 * z-stat — a stacked statistic: a prominent value over a small muted label.
 * This is the homepage hero pattern ("50+" / "Components") lifted into a
 * reusable element. Pass `value` and `label` as strings, or slot richer content
 * (default slot = value, `label` slot = caption). It composes z-heading and
 * z-text internally, so it inherits the same type scale and colors as the rest
 * of the system.
 *
 *   <z-stat value="50+" label="Components"></z-stat>
 *
 * `size` scales the value via the z-heading sizes (xxl…xs); `align` switches the
 * cross-axis alignment for centered or right-aligned stat rows.
 */
const styles = css`
	:host {
		display: inline-flex;
	}

	:host([is-hidden]) {
		display: none;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.stat.is-center {
		align-items: center;
		text-align: center;
	}

	.stat.is-end {
		align-items: flex-end;
		text-align: right;
	}
`

const resolveAlignClass = (props: any): string => {
	if (props.align === 'center') return 'is-center'
	if (props.align === 'end') return 'is-end'
	return ''
}

export const ZStat = c(
	(props) => {
		const className = ['stat', resolveAlignClass(props)].filter(Boolean).join(' ')

		return (
			<host shadowDom>
				<div class={className}>
					<z-heading size={props.size || 'xs'} tag='span' color={props.color || undefined}>
						{props.value}
						<slot />
					</z-heading>
					<z-text size={props.labelSize || 'sm'} color={props.labelColor || 'muted'}>
						{props.label}
						<slot name='label' />
					</z-text>
				</div>
			</host>
		)
	},
	{
		props: {
			value: { type: String, reflect: true },
			label: { type: String, reflect: true },
			size: { type: String, reflect: true },
			labelSize: { type: String, reflect: true },
			color: { type: String, reflect: true },
			labelColor: { type: String, reflect: true },
			align: { type: String, reflect: true },
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-stat', ZStat)
