import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZLabelDoc = () => (
	<ComponentDoc
		tag="z-label"
		category="Foundations"
		description="A compact UI label with the shared text API. Use a label tag to give form controls an accessible, visible name."
	>
		<DocExample
			demo="z-label/name-a-field"
			title="Name a field"
			description="Reference the visible label with aria-labelledby; this works across the component shadow boundary."
		/>
		<DocExample
			demo="z-label/clarify-optionality"
			title="Clarify optionality"
			description="Put support beside or below the label; never use a placeholder as the only label."
		/>
		<DocExample
			demo="z-label/use-labels-for-compact-metadata"
			title="Use labels for compact metadata"
			description="They also work for small field names in a static interface."
		/>
	</ComponentDoc>
)
