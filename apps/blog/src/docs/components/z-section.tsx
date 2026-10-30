import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSectionDoc = () => (
	<ComponentDoc
		tag="z-section"
		category="Layout"
		description="A semantic page band with deliberate vertical rhythm. It can wrap a container directly, keeping section spacing and horizontal constraints in one dependable primitive."
	>
		<DocExample
			demo="z-section/create-a-page-band"
			title="Create a page band"
			description="space controls breathing room above and below a related area."
		/>
		<DocExample
			demo="z-section/use-the-built-in-content"
			title="Use the built-in content boundary"
			description="container and gutter remove the need for an extra wrapper in common page sections."
		/>
		<DocExample
			demo="z-section/reserve-stronger-spacing-for-a"
			title="Reserve stronger spacing for a new thought"
			description="Use larger space between major narrative or application regions, not between every child."
		/>
	</ComponentDoc>
)
