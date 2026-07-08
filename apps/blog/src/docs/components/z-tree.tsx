import { ComponentDoc } from '@app/docs/ComponentDoc'

const TREE_ITEMS = [
	{
		id: 'src',
		label: 'src',
		isExpanded: true,
		children: [
			{
				id: 'components',
				label: 'components',
				isExpanded: true,
				children: [
					{ id: 'button', label: 'z-button.tsx' },
					{ id: 'input', label: 'z-input.tsx', isSelected: true },
					{ id: 'tree', label: 'z-tree.tsx' }
				]
			},
			{ id: 'index', label: 'index.ts' }
		]
	},
	{ id: 'pkg', label: 'package.json' },
	{ id: 'readme', label: 'README.md', isDisabled: true }
]

export const ZTreeDoc = () => (
	<ComponentDoc
		tag="z-tree"
		category="Data Display"
		description="A data-driven hierarchical tree — feed it a recursive items array and it handles expand/collapse, single/multiple selection, and full keyboard nav (↑/↓ move, →/← expand or step in/out, Enter/Space select)."
	>
		<div className="block">
			<div className="panel">
				<z-tree items={TREE_ITEMS} style={{ width: '18rem' }} />
			</div>
		</div>
	</ComponentDoc>
)
