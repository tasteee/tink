import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZPanelHandleDoc = () => (
	<ComponentDoc
		tag="z-panel-handle"
		description="The draggable divider between two z-panel panes. Drag it with a pointer, or focus it and use the arrow keys."
	>
		<DocExample
			demo="z-panel-handle/collapsible"
			title="Between two panes"
			description="Place one handle between each pair of z-panel elements."
		/>
	</ComponentDoc>
)
