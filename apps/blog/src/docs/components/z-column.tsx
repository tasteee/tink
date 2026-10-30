import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZColumnDoc = () => (
	<ComponentDoc
		tag="z-column"
		category="Layout"
		description="The vertical counterpart to z-row. It makes reading order and spacing explicit without turning every grouping into a boxed container."
	>
		<DocExample
			demo="z-column/a-content-stack"
			title="A content stack"
			description="Use a column for a small, semantically connected run of content."
		/>
		<DocExample
			demo="z-column/vertical-distribution"
			title="Vertical distribution"
			description="Give the column a height only when distributing its children is meaningful."
		/>
		<DocExample
			demo="z-column/center-a-focused-state"
			title="Center a focused state"
			description="Centering should be a deliberate composition, not a replacement for normal document flow."
		/>
	</ComponentDoc>
)
