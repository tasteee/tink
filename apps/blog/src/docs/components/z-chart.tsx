import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZChartDoc = () => (
	<ComponentDoc
		tag="z-chart"
		description="A single-series bar, line, or area chart with no dependencies. data is an array of { label, value }."
	>
		<DocExample demo="z-chart/bar" title="Bar, with grid" description="show-grid adds quiet horizontal guides." />
		<DocExample demo="z-chart/area" title="Area, secondary tone" />
	</ComponentDoc>
)
