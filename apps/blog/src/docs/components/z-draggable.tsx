import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZDraggableDoc = () => (
	<ComponentDoc
		tag="z-draggable"
		category="Specialized"
		description="A pointer-based drag source (deliberately not native HTML5 DnD, which is inconsistent and hard to style). Give it a type + data; pairs with z-drop-target, which accepts the drop when its accept list matches."
	>
		<DocExample demo="z-draggable/overview" title="Overview" description="" />
	</ComponentDoc>
)
