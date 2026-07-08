import { c, css } from 'atomico'
import { resolveSize } from '../shared/layout-schema'

/*
 * z-bento-grid — a fixed-row-height CSS grid for slotted z-bento-item cells.
 * Items opt into a footprint via `col-span`/`row-span`; the grid just sets
 * the column count and the height of one row unit.
 */
const styles = css`
	:host {
		display: grid;
		grid-template-columns: repeat(var(--bento-columns, 3), minmax(0, 1fr));
		grid-auto-rows: var(--bento-row-height, 14rem);
		gap: var(--bento-gap, var(--spacing-4));
	}

	:host([is-hidden]) {
		display: none;
	}
`

export const ZBentoGrid = c(
	(props) => {
		const hostStyle: Record<string, string> = {}
		if (props.columns) hostStyle['--bento-columns'] = String(props.columns)
		if (props.rowHeight) hostStyle['--bento-row-height'] = props.rowHeight
		const gap = resolveSize(props.gap)
		if (gap) hostStyle['--bento-gap'] = gap

		return (
			<host shadowDom style={hostStyle}>
				<slot />
			</host>
		)
	},
	{
		props: {
			columns: Number,
			rowHeight: String,
			gap: String,
			isHidden: { type: Boolean, reflect: true }
		},
		styles
	}
)

customElements.define('z-bento-grid', ZBentoGrid)
