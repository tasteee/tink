import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZResizablePanelsDoc = () => (
	<ComponentDoc
		tag="z-resizable-panels"
		description="A row or column of z-panel panes separated by draggable z-panel-handle dividers. Sizes are percentages or px, with min/max limits per pane."
	>
		<DocExample
			demo="z-resizable-panels/three-panes"
			title="Three panes"
			description="Drag either handle. Each pane holds its min-size."
		/>
		<DocExample
			demo="z-resizable-panels/collapsible"
			title="A collapsible pane"
			description="collapsible + collapsed-size snaps a pane shut when dragged past its collapse threshold."
		/>
	</ComponentDoc>
)
