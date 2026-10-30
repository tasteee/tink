import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZDropTargetDoc = () => (
	<ComponentDoc
		tag="z-drop-target"
		category="Specialized"
		description={
			'The drop surface for z-draggable. It matches a draggable when their group is equal and accept includes the draggable’s type (or accept is "*"), a mismatched drag over it shows the reject state via data-state="reject".'
		}
	>
		<DocExample demo="z-drop-target/overview" title="Overview" description="" />
	</ComponentDoc>
)
