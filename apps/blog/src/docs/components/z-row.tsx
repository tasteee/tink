import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZRowDoc = () => (
	<ComponentDoc
		tag="z-row"
		category="Layout"
		description="A direct horizontal layout primitive. Use it for an intentional relationship between siblings, then let wrapping preserve that relationship on narrow screens."
	>
		<DocExample
			demo="z-row/a-calm-action-row"
			title="A calm action row"
			description="Start with the default alignment; add only the spacing the relationship needs."
		/>
		<DocExample
			demo="z-row/alignment-without-utility-classes"
			title="Alignment without utility classes"
			description="aligns-x controls the main (horizontal) axis; aligns-y controls the cross axis."
		/>
		<DocExample
			demo="z-row/wrap-when-the-contents-are"
			title="Wrap when the contents are peers"
			description="Use wrap for a collection of equal controls, not to force a page layout to fit."
		/>
	</ComponentDoc>
)
