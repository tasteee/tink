import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZTextDoc = () => (
	<ComponentDoc
		tag="z-text"
		category="Foundations"
		description="The default component for interface copy. It makes body scale, color intent, semantic tag, and modest editorial emphasis explicit."
	>
		<DocExample
			demo="z-text/write-the-supporting-sentence"
			title="Write the supporting sentence"
			description="Use normal text for explanation that follows a title or control."
		/>
		<DocExample
			demo="z-text/use-color-as-intent"
			title="Use color as intent"
			description="Muted is supporting context; accent colors communicate a deliberate, limited emphasis."
		/>
		<DocExample
			demo="z-text/use-semantic-tags-when-needed"
			title="Use semantic tags when needed"
			description="Visual presentation and HTML semantics can be set independently."
		/>
		<DocExample
			demo="z-text/apply-editorial-treatment-locally"
			title="Apply editorial treatment locally"
			description="For a phrase inside a sentence, use z-inline instead of nesting another text component."
		/>
	</ComponentDoc>
)
