import { defineElement } from '../shared/define-element'
import { c, css } from 'atomico'
import { oneOf } from '../shared/prop-types'

/*
 * z-line, a bare hairline rule. `direction="vertical"` stands it up
 * between items in a row; it stretches to the row's height.
 */
const styles = css`
	:host {
		display: block;
		flex-shrink: 0;
		background: var(--border);
		height: 1px;
		width: 100%;
	}

	:host([direction='vertical']) {
		height: 100%;
		width: 1px;
	}
`

export const ZLine = c(
	(props) => {
		const isVertical = props.direction === 'vertical'
		const orientation = isVertical ? 'vertical' : 'horizontal'

		return <host shadowDom role="separator" aria-orientation={orientation}></host>
	},
	{
		props: {
			direction: { type: oneOf('horizontal', 'vertical'), reflect: true }
		},
		styles
	}
)

defineElement('z-line', ZLine)
