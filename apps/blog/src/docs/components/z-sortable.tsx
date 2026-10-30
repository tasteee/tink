import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSortableDoc = () => (
	<ComponentDoc
		tag="z-sortable"
		category="Specialized"
		description={
			'Drag-to-reorder for its direct children, lifts the dragged child out of flow with a same-sized placeholder taking its place, then drops it wherever the placeholder landed. Fires sort {oldIndex,newIndex} to sync app state.'
		}
	>
		<DocExample demo="z-sortable/overview" title="Overview" description="" />
	</ComponentDoc>
)
