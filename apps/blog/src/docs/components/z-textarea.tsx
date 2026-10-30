import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZTextareaDoc = () => (
	<ComponentDoc
		tag="z-textarea"
		category="Forms"
		description="A multi-line text field for a meaningful amount of freeform content. Use z-input for short, single-line values."
	>
		<DocExample
			demo="z-textarea/collect-a-short-message"
			title="Collect a short message"
			description="Use z-field for the visible, accessible label and a useful initial height."
		/>
		<DocExample
			demo="z-textarea/explain-validation-next-to-the"
			title="Explain validation next to the field"
			description="Keep the error specific and actionable."
		/>
	</ComponentDoc>
)
