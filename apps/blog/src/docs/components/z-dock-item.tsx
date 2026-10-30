import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZDockItemDoc = () => (
	<ComponentDoc
		tag="z-dock-item"
		category="Navigation"
		description="One labeled icon action inside z-dock. It never stands alone: the parent supplies magnification and the item supplies semantics."
	>
		<DocExample
			demo="z-dock-item/use-a-label-and-active"
			title="Use a label and active marker"
			description="The label becomes the accessible name and hover tooltip. is-active adds the small current-location marker."
		/>
		<DocExample
			demo="z-dock-item/choose-link-or-command-semantics"
			title="Choose link or command semantics"
			description="href renders a real link. Without it, the item is a button and emits select for application-controlled commands."
		/>
	</ComponentDoc>
)
