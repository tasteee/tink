import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZLinkDoc = () => (
	<ComponentDoc
		tag="z-link"
		category="Actions"
		description="A semantic anchor with deliberate tone and underline behavior. Use it for navigation; use z-button when the action changes application state."
	>
		<DocExample
			demo="z-link/link-to-another-place"
			title="Link to another place"
			description="Links navigate. Keep the label specific enough to predict the destination."
		/>
		<DocExample
			demo="z-link/use-underline-intentionally"
			title="Use underline intentionally"
			description="Hover underline is the default; always is useful in prose, none is reserved for obvious navigation UI."
		/>
		<DocExample
			demo="z-link/mark-external-destinations"
			title="Mark external destinations"
			description="is-external sets target and safe rel values automatically, then appends an external-link icon."
		/>
	</ComponentDoc>
)
