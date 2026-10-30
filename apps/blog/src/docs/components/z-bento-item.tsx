import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZBentoItemDoc = () => (
	<ComponentDoc
		tag="z-bento-item"
		description="A single cell inside z-bento-grid, always used as its child, never standalone."
	>
		<DocExample
			demo="z-bento-item/in-a-grid"
			title="Cells in a bento grid"
			description="col-span and row-span set the footprint; slot=icon and slot=background decorate it; an href reveals a hover call to action."
		/>
	</ComponentDoc>
)
