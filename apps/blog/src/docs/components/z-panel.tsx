import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZPanelDoc = () => (
	<ComponentDoc
		tag="z-panel"
		description="One pane inside z-resizable-panels. Declares default-size / min-size / max-size (% or px) and exposes collapse(), expand(), resize(size), getSize(), and isCollapsed()."
	>
		<DocExample
			demo="z-panel/collapsible"
			title="Size and collapse a pane"
			description="Always a child of z-resizable-panels. Drag the handle past the threshold to snap the collapsible pane shut."
		/>
	</ComponentDoc>
)
