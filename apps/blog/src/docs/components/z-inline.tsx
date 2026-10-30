import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZInlineDoc = () => (
	<ComponentDoc
		tag="z-inline"
		category="Foundations"
		description="An inline style patch that inherits surrounding type scale, line height, and font family. Use it for a local emphasis without breaking the sentence rhythm."
	>
		<DocExample
			demo="z-inline/emphasize-within-a-sentence"
			title="Emphasize within a sentence"
			description="z-inline stays in the parent’s type scale."
		/>
		<DocExample
			demo="z-inline/add-a-quiet-aside"
			title="Add a quiet aside"
			description="Muted inline text is useful for qualifying detail without creating another paragraph."
		/>
		<DocExample
			demo="z-inline/preserve-heading-rhythm"
			title="Preserve heading rhythm"
			description="Inline emphasis is preferable to nesting a text component in a heading."
		/>
	</ComponentDoc>
)
