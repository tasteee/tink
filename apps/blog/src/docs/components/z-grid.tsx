import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZGridDoc = () => (
	<ComponentDoc
		tag="z-grid"
		category="Layout"
		description="A grid for repeated peers. Choose a known column count for a stable composition, or a minimum track width when the grid should respond naturally to available space."
	>
		<DocExample
			demo="z-grid/use-a-known-track-count"
			title="Use a known track count"
			description="A fixed count is ideal when the visual rhythm matters more than fluid density."
		/>
		<DocExample
			demo="z-grid/let-available-space-decide"
			title="Let available space decide"
			description="min-column-width creates as many equal tracks as will fit without media-query bookkeeping."
		/>
		<DocExample
			demo="z-grid/make-repeated-information-scannable"
			title="Make repeated information scannable"
			description="Keep item structure consistent; a grid should not become a collection of unrelated cards."
		/>
	</ComponentDoc>
)
