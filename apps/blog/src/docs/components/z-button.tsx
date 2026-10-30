import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZButtonDoc = () => (
	<ComponentDoc
		tag="z-button"
		category="Actions"
		description="A native-button-backed action. Choose a single primary action per decision, then let hierarchy make the rest quiet."
	>
		<DocExample
			demo="z-button/establish-action-hierarchy"
			title="Establish action hierarchy"
			description="Solid is the primary commitment. Outline and plain actions support it without competing."
		/>
		<DocExample
			demo="z-button/choose-kind-before-color"
			title="Choose kind before color"
			description="Kind communicates priority; tone communicates meaning or brand emphasis."
		/>
		<DocExample
			demo="z-button/represent-pending-work-honestly"
			title="Represent pending work honestly"
			description="Loading disables the native button, preventing a duplicate submission while keeping the action visible."
		/>
		<DocExample
			demo="z-button/use-a-button-inside-a"
			title="Use a button inside a form"
			description="The default type is button. Set submit explicitly when it submits the nearest form."
		/>
	</ComponentDoc>
)
