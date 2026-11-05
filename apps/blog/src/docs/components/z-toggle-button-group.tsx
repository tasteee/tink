import { ComponentDoc, ComponentPart } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZToggleButtonGroupDoc = () => (
	<ComponentDoc
		tag="z-toggle-button-group"
		partTags={['z-toggle-button-group-item']}
		category="Actions"
		description="Coordinates pressed state across z-toggle-button-group-item children. Use it for modes, filters, and formatting choices with one or many active values."
	>
		<DocExample
			demo="z-toggle-button-group/choose-one-mode"
			title="Choose one mode"
			description="Single selection makes the current mode obvious and ensures only one item remains pressed."
		/>
		<DocExample
			demo="z-toggle-button-group/select-several-formatting-options"
			title="Select several formatting options"
			description="Multiple selection leaves every item independent while reporting the full selected-value array."
		/>
		<DocExample
			demo="z-toggle-button-group/persist-the-group-selection"
			title="Persist the group selection"
			description="Listen at the group, rather than attaching separate state handlers to every item."
		/>
		<ComponentPart
			tag="z-toggle-button-group-item"
			description="One value inside the group. It is never standalone: the group provides the selection model and emits the change event."
		>
			<DocExample
				demo="z-toggle-button-group-item/give-every-item-a-stable"
				title="Give every item a stable value"
				description="Use values your application can store; labels can change without breaking persisted state."
			/>
			<DocExample
				demo="z-toggle-button-group-item/set-initial-state-declaratively"
				title="Set initial state declaratively"
				description="The group reconciles is-pressed as the user changes selection."
			/>
		</ComponentPart>
	</ComponentDoc>
)
