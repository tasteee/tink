import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZRadioGroupDoc = () => (
	<ComponentDoc
		tag="z-radio-group"
		category="Forms"
		description="A semantic exclusive-choice set that owns value and coordinates z-radio children."
	>
		<DocExample
			demo="z-radio-group/ask-one-clear-question"
			title="Ask one clear question"
			description="Use label to name the selection set for people using assistive technology."
		/>
		<DocExample
			demo="z-radio-group/persist-the-selected-value"
			title="Persist the selected value"
			description="Listen on the group rather than every child."
		/>
	</ComponentDoc>
)
