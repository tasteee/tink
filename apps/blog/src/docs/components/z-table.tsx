import { ComponentDoc } from '@app/docs/ComponentDoc'
import { withProps } from '@app/docs/withProps'

const TABLE_COLUMNS = [
	{ key: 'project', label: 'Project' },
	{ key: 'owner', label: 'Owner' },
	{ key: 'status', label: 'Status' },
	{ key: 'updated', label: 'Updated', align: 'end', isMono: true }
]
const TABLE_ROWS = [
	{ id: 1, project: 'Project Alpha', owner: '@creator', status: 'Active', updated: '2 min' },
	{ id: 2, project: 'Campaign Beta', owner: '@team', status: 'Draft', updated: '1 day' },
	{ id: 3, project: 'Legacy Drop', owner: '@archive', status: 'Archived', updated: '1 wk' }
]

export const ZTableDoc = () => (
	<ComponentDoc
		tag="z-table"
		category="Data Display"
		description="Data-driven table with hairline rows — takes `columns` and `rows` arrays."
	>
		<div className="block">
			<div className="panel">
				<z-table isClickable ref={withProps({ columns: TABLE_COLUMNS, rows: TABLE_ROWS })} />
			</div>
		</div>
	</ComponentDoc>
)
