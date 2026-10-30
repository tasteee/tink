import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZTableDoc = () => (
	<ComponentDoc
		tag="z-table"
		category="Data Display"
		description="Data-driven table with hairline rows, takes `columns` and `rows` arrays."
	>
		<DocExample demo="z-table/overview" title="Overview" description="" />
	</ComponentDoc>
)
