import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZEmptyStateDoc = () => (
	<ComponentDoc
		tag="z-empty-state"
		category="Specialized"
		description="The blank-slate placeholder — heading, description, optional icon and action slot."
	>
		<div className="block">
			<div className="panel">
				<z-empty-state heading='No projects yet' description='Create your first project to see it here.' isBordered>
					<svg slot='icon' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
						<path d='M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z' />
					</svg>
					<z-button kind='solid' tone='primary' size='small'>New project</z-button>
				</z-empty-state>
			</div>
		</div>
	</ComponentDoc>
)
