import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZEyebrowDoc = () => (
	<ComponentDoc tag="z-eyebrow" category="Foundations" description="An uppercase, letter-spaced kicker for introducing a page or section. It can take its label from content or from a label property, with an optional trailing rule.">
		<DocExample title="Introduce a section" description="Place it directly before a heading. Spacing belongs to the surrounding layout primitive, not the eyebrow itself." code={`<z-column gap="2">
  <z-eyebrow tone="primary" has-rule>Selected work</z-eyebrow>
  <z-heading size="lg">Recent projects</z-heading>
</z-column>`}>
			<z-column gap="2" style={{ alignItems: 'flex-start' }}>
				<z-eyebrow tone="primary" hasRule>Selected work</z-eyebrow>
				<z-heading size="lg">Recent projects</z-heading>
			</z-column>
		</DocExample>
		<DocExample title="Stretch the rule across a container" description="full-width lets the rule consume the remaining inline space; label is useful when the text comes from application state." code={`<z-eyebrow label="Documentation" full-width has-rule />`}>
			<z-eyebrow label="Documentation" fullWidth hasRule style={{ width: '100%' }} />
		</DocExample>
	</ComponentDoc>
)
