import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZRangeDoc = () => (
	<ComponentDoc
		tag="z-range"
		category="Forms"
		description="One track with two or more z-range-handle children. Handles never cross, making it suited to filters and bounded intervals."
	>
		<DocExample
			demo="z-range/set-a-price-interval"
			title="Set a price interval"
			description="Give the entire range a domain, then place two handles at the selected bounds."
		/>
		<DocExample
			demo="z-range/constrain-an-individual-handle"
			title="Constrain an individual handle"
			description="Handle min/max limits constrain its own travel while the range still prevents crossing."
		/>
	</ComponentDoc>
)
