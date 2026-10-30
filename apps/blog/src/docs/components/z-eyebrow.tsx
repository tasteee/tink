import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZEyebrowDoc = () => (
	<ComponentDoc
		tag="z-eyebrow"
		category="Foundations"
		description="An uppercase, letter-spaced kicker for introducing a page or section. It can take its label from content or from a label property, with an optional trailing rule."
	>
		<DocExample
			demo="z-eyebrow/introduce-a-section"
			title="Introduce a section"
			description="Place it directly before a heading. Spacing belongs to the surrounding layout primitive, not the eyebrow itself."
		/>
		<DocExample
			demo="z-eyebrow/stretch-the-rule-across-a"
			title="Stretch the rule across a container"
			description="full-width lets the rule consume the remaining inline space; label is useful when the text comes from application state."
		/>
	</ComponentDoc>
)
