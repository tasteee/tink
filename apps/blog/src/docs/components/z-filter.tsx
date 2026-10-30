import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZFilterDoc = () => (
	<ComponentDoc
		tag="z-filter"
		category="Forms"
		description="A pill-based single-value facet with an optional drill-down tree. It is for filtering a visible result set, not choosing a persistent form field."
	>
		<DocExample
			demo="z-filter/filter-a-result-set"
			title="Filter a result set"
			description="After a value is selected, the control collapses to the active pill and a reset affordance."
		/>
		<DocExample
			demo="z-filter/drill-into-a-hierarchy"
			title="Drill into a hierarchy"
			description="Branches reveal their children while retaining the path needed to go back."
		/>
	</ComponentDoc>
)
