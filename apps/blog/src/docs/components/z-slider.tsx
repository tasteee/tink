import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSliderDoc = () => (
	<ComponentDoc
		tag="z-slider"
		category="Forms"
		description="A single continuous or stepped numeric value. Pair it with a visible value when precision matters."
	>
		<DocExample
			demo="z-slider/select-a-bounded-value"
			title="Select a bounded value"
			description="Use min, max, and step to make the valid interval explicit."
		/>
		<DocExample
			demo="z-slider/show-the-current-value-nearby"
			title="Show the current value nearby"
			description="Do not make people infer a precise value from thumb position."
		/>
	</ComponentDoc>
)
