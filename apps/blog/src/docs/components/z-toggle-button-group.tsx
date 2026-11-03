import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZToggleButtonGroupDoc = () => (
	<ComponentDoc
		tag="z-toggle-button-group"
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
	</ComponentDoc>
)
