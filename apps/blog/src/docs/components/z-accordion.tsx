import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZAccordionDoc = () => (
	<ComponentDoc
		tag="z-accordion"
		category="Navigation"
		description="A bordered set of disclosures. Choose single-open for focused FAQs and multiple-open when comparing answers matters."
	>
		<DocExample
			demo="z-accordion/keep-one-answer-in-focus"
			title="Keep one answer in focus"
			description="Single is the default: opening one z-collapsible closes its siblings."
		/>
		<DocExample
			demo="z-accordion/allow-comparison"
			title="Allow comparison"
			description="Use multiple when readers may need several specifications or answers open at the same time."
		/>
	</ComponentDoc>
)
