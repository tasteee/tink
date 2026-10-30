import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZDrawerDoc = () => (
	<ComponentDoc
		tag="z-drawer"
		category="Overlays"
		description="A bottom-sheet modal with a grab handle. Use it for focused mobile-friendly choices or quick actions that should stay close to the current screen."
	>
		<DocExample
			demo="z-drawer/offer-a-compact-action-set"
			title="Offer a compact action set"
			description="The drawer supplies its handle and dismissal gesture. Keep its content short enough that people can complete the task without losing context."
		/>
		<DocExample
			demo="z-drawer/respect-every-dismissal-path"
			title="Respect every dismissal path"
			description="Users can drag the handle down, press Escape, click the backdrop, or close programmatically. Listen for close to synchronize host state."
		/>
	</ComponentDoc>
)
