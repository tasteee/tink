import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSheetDoc = () => (
	<ComponentDoc
		tag="z-sheet"
		category="Overlays"
		description="A modal panel entering from a page edge. Use it for supporting work such as filters or navigation that benefits from more room than a popover."
	>
		<DocExample
			demo="z-sheet/keep-filter-actions-available"
			title="Keep filter actions available"
			description="Use the default slot for controls and footer for the commit action. This preserves the action while a long filter list scrolls."
		/>
		<DocExample
			demo="z-sheet/choose-the-edge-to-match"
			title="Choose the edge to match the job"
			description="Right is a natural secondary workspace or inspector; left fits navigation. Like dialogs, sheets are modal and should not be stacked."
		/>
	</ComponentDoc>
)
