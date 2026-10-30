import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZDisplayDoc = () => (
	<ComponentDoc
		tag="z-display"
		category="Foundations"
		description="Fluid, oversized display type for page heroes. It scales with the viewport while retaining the shared Zest color and weight vocabulary."
	>
		<DocExample
			demo="z-display/establish-a-page-hero"
			title="Establish a page hero"
			description="Use z-display for the page’s single visual headline; pair it with z-eyebrow and ordinary z-text for supporting copy."
		/>
		<DocExample
			demo="z-display/choose-the-semantic-heading"
			title="Choose the semantic heading"
			description="It renders an h1 by default. Use tag when this is a section heading or decorative treatment within a page that already has an h1."
		/>
	</ComponentDoc>
)
