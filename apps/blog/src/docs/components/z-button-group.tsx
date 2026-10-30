import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZButtonGroupDoc = () => (
	<ComponentDoc
		tag="z-button-group"
		category="Actions"
		description="A seamless row or column of adjacent buttons. Use it for neighboring actions that act on the same object, not for selection state."
	>
		<DocExample
			demo="z-button-group/keep-sibling-actions-together"
			title="Keep sibling actions together"
			description="The group removes visual seams while preserving each button as a separate action."
		/>
		<DocExample
			demo="z-button-group/use-a-vertical-group-for"
			title="Use a vertical group for a compact tool rail"
			description="Vertical composition is useful when a narrow inspector needs several sibling commands."
		/>
	</ComponentDoc>
)
