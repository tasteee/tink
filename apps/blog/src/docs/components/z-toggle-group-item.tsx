import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZToggleGroupItemDoc = () => (
	<ComponentDoc
		tag="z-toggle-group-item"
		category="Actions"
		description="One value inside z-toggle-group. It is never standalone: the parent provides the selection model and emits the group change event."
	>
		<DocExample
			demo="z-toggle-group-item/give-every-item-a-stable"
			title="Give every item a stable value"
			description="Use values your application can store; labels can change without breaking persisted state."
		/>
		<DocExample
			demo="z-toggle-group-item/set-initial-state-declaratively"
			title="Set initial state declaratively"
			description="The group reconciles is-pressed as the user changes selection."
		/>
	</ComponentDoc>
)
