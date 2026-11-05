import { ComponentDoc, ComponentPart } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZBentoGridDoc = () => (
	<ComponentDoc
		tag="z-bento-grid"
		partTags={['z-bento-item']}
		category="Layout"
		description="A fixed-row feature grid built for z-bento-item children. Use it when a small set of related capabilities benefits from varied, deliberate visual weight."
	>
		<DocExample
			demo="z-bento-grid/compose-an-intentional-feature-grid"
			title="Compose an intentional feature grid"
			description="Give the grid a shared row height, then use spans only to establish hierarchy."
		/>
		<DocExample
			demo="z-bento-grid/use-spans-to-prioritize-not"
			title="Use spans to prioritize, not decorate"
			description="One larger story is usually enough; preserve a clear scan path."
		/>
		<DocExample
			demo="z-bento-grid/make-linked-items-explicit"
			title="Make linked items explicit"
			description="href turns an item into a destination and reveals a compact CTA."
		/>
		<ComponentPart
			tag="z-bento-item"
			description="A single cell inside the grid, always used as its child, never standalone."
		>
			<DocExample
				demo="z-bento-item/in-a-grid"
				title="Cells in a bento grid"
				description="col-span and row-span set the footprint; slot=icon and slot=background decorate it; an href reveals a hover call to action."
			/>
		</ComponentPart>
	</ComponentDoc>
)
