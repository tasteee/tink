import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZCheckboxDoc = () => (
	<ComponentDoc
		tag="z-checkbox"
		category="Forms"
		description="A binary choice where people can independently select zero, one, or many options."
	>
		<DocExample
			demo="z-checkbox/make-the-choice-self-contained"
			title="Make the choice self-contained"
			description="The visible label should state what happens when it is checked."
		/>
		<DocExample
			demo="z-checkbox/represent-partial-selection"
			title="Represent partial selection"
			description="Indeterminate describes a mixed child state; it is not a third persistent user choice."
		/>
	</ComponentDoc>
)
