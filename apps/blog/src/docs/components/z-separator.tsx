import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSeparatorDoc = () => (
	<ComponentDoc
		tag="z-separator"
		category="Foundations"
		description="A hairline divider with optional text at its center. It gives an explicit transition a little more voice than z-line."
	>
		<DocExample
			demo="z-separator/separate-alternative-actions"
			title="Separate alternative actions"
			description="A label makes the relationship between two action paths clear."
		/>
		<DocExample
			demo="z-separator/create-a-labeled-document-break"
			title="Create a labeled document break"
			description="Keep labels short and structural, not explanatory."
		/>
		<DocExample
			demo="z-separator/use-an-unlabeled-separator-sparingly"
			title="Use an unlabeled separator sparingly"
			description="When no label is needed, z-line is usually the quieter choice."
		/>
	</ComponentDoc>
)
