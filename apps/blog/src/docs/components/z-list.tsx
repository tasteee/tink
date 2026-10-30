import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZListDoc = () => (
	<ComponentDoc
		tag="z-list"
		category="Data Display"
		description="A vertical stack of hairline-divided rows on a card surface. Compose with z-list-row, whose second child grows to fill the row."
	>
		<DocExample demo="z-list/rows" title="Rows" description="icon · growing title block · trailing action" />
		<DocExample
			demo="z-list/wrapping-content"
			title="Wrapping content"
			description="is-wrap drops a child onto its own full-width line"
		/>
	</ComponentDoc>
)
