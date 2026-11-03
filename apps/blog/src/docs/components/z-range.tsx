import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZRangeDoc = () => (
	<ComponentDoc
		tag="z-range"
		category="Forms"
		description="One track with two handles, set through the value and handles array properties. Handles never cross, making it suited to filters and bounded intervals."
	>
		<DocExample
			demo="z-range/set-a-price-interval"
			title="Set a price interval"
			description="Give the range a domain, then set value to the selected [lower, upper] pair."
		/>
		<DocExample
			demo="z-range/constrain-an-individual-handle"
			title="Constrain an individual handle"
			description="A handles entry's min/max limits that handle's travel while the range still prevents crossing."
		/>
	</ComponentDoc>
)
