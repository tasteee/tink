import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZDisplayDoc = () => (
	<ComponentDoc tag="z-display" category="Foundations" description="Fluid, oversized display type for page heroes. It scales with the viewport while retaining the shared Zest color and weight vocabulary.">
		<DocExample title="Establish a page hero" description="Use z-display for the page’s single visual headline; pair it with z-eyebrow and ordinary z-text for supporting copy." code={`<z-eyebrow has-rule>Release notes</z-eyebrow>
<z-display size="xl" color="primary">Build with taste.</z-display>`}>
			<z-column gap="3" style={{ alignItems: 'flex-start' }}>
				<z-eyebrow hasRule>Release notes</z-eyebrow>
				<z-display size="xl" color="primary">Build with taste.</z-display>
			</z-column>
		</DocExample>
		<DocExample title="Choose the semantic heading" description="It renders an h1 by default. Use tag when this is a section heading or decorative treatment within a page that already has an h1." code={`<z-display size="md" weight="900" tag="h2">Now playing</z-display>`}>
			<z-display size="md" weight="900" tag="h2">Now playing</z-display>
		</DocExample>
	</ComponentDoc>
)
