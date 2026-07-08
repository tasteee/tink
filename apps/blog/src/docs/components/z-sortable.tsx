import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZSortableDoc = () => (
	<ComponentDoc
		tag="z-sortable"
		category="Specialized"
		description="Drag-to-reorder for its direct children — lifts the dragged child out of flow with a same-sized placeholder taking its place, then drops it wherever the placeholder landed. Fires sort {oldIndex,newIndex} to sync app state."
	>
		<div className="block">
			<div className="panel">
				<z-sortable axis="y" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '16rem' }}>
					<z-card style={{ cursor: 'grab' }}>Introduce the feature</z-card>
					<z-card style={{ cursor: 'grab' }}>Draft the announcement</z-card>
					<z-card style={{ cursor: 'grab' }}>Ship to prod</z-card>
				</z-sortable>
			</div>
		</div>
	</ComponentDoc>
)
