import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZRangeHandleDoc = () => (
	<ComponentDoc
		tag="z-range-handle"
		category="Forms"
		description="One movable thumb inside z-range. It defines a value and optional per-thumb travel constraints; it has no useful standalone role."
	>
		<DocExample
			demo="z-range-handle/use-handles-as-direct-children"
			title="Use handles as direct children"
			description="The parent measures and coordinates each handle."
		/>
		<DocExample
			demo="z-range-handle/bound-the-handle-s-travel"
			title="Bound the handle’s travel"
			description="Per-handle limits are useful when a value cannot enter part of the parent range."
		/>
	</ComponentDoc>
)
