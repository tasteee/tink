import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZLineDoc = () => (
	<ComponentDoc
		tag="z-line"
		category="Foundations"
		description="A minimal hairline divider. Use it to make an existing relationship easier to scan, not to box every part of the interface."
	>
		<DocExample
			demo="z-line/divide-stacked-sections"
			title="Divide stacked sections"
			description="A horizontal line stretches to the width of its containing layout."
		/>
		<DocExample
			demo="z-line/separate-inline-metadata"
			title="Separate inline metadata"
			description="Constrain the vertical line with its container height."
		/>
		<DocExample
			demo="z-line/choose-the-right-divider"
			title="Choose the right divider"
			description="Use z-separator when the break needs a label; use spacing alone when the relationship remains clear."
		/>
	</ComponentDoc>
)
