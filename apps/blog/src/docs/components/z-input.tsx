import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZInputDoc = () => (
	<ComponentDoc
		tag="z-input"
		category="Forms"
		description="A single-line text field with native input behavior and Zest focus, invalid, and tone states. Wrap standalone fields in z-field for their label and guidance."
	>
		<DocExample
			demo="z-input/name-the-field-with-z"
			title="Name the field with z-field"
			description="z-field provides the visible label and forwards it through the component shadow boundary as the input’s accessible name."
		/>
		<DocExample
			demo="z-input/show-validation-after-a-decision"
			title="Show validation after a decision"
			description="Invalid is feedback for a known problem, not a substitute for field guidance."
		/>
		<DocExample
			demo="z-input/choose-a-focus-tone-sparingly"
			title="Choose a focus tone sparingly"
			description="Tone supports a product context; neutral remains the default for ordinary data entry."
		/>
	</ComponentDoc>
)
