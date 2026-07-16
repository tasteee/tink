import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZColumnDoc = () => (
	<ComponentDoc tag="z-column" category="Layout" description="The vertical counterpart to z-row. It makes reading order and spacing explicit without turning every grouping into a boxed container.">
		<DocExample title="A content stack" description="Use a column for a small, semantically connected run of content." code={`<z-column gap="2">
  <z-heading size="xs">Project notes</z-heading>
  <z-text color="muted">A short summary belongs close to its heading.</z-text>
</z-column>`}>
			<z-column gap="2"><z-heading size="xs">Project notes</z-heading><z-text color="muted">A short summary belongs close to its heading.</z-text></z-column>
		</DocExample>
		<DocExample title="Vertical distribution" description="Give the column a height only when distributing its children is meaningful." code={`<z-column gap="2" aligns-y="between" full-height style="height: 12rem">
  <z-eyebrow>Draft</z-eyebrow>
  <z-button kind="outline">Review</z-button>
</z-column>`}>
			<z-column gap="2" alignsY="between" fullHeight style={{ height: '12rem' }}><z-eyebrow>Draft</z-eyebrow><z-button kind="outline">Review</z-button></z-column>
		</DocExample>
		<DocExample title="Center a focused state" description="Centering should be a deliberate composition, not a replacement for normal document flow." code={`<z-column gap="2" aligns-x="center">
  <z-empty-state heading="No saved views" description="Create a view to return to it later." />
</z-column>`}>
			<z-column gap="2" alignsX="center"><z-empty-state heading="No saved views" description="Create a view to return to it later." /></z-column>
		</DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Props</z-heading><dl><dt>gap</dt><dd>Token, CSS length, or number between children.</dd><dt>aligns-x / aligns-y</dt><dd>Cross- and main-axis alignment respectively in a column.</dd><dt>full-width / full-height</dt><dd>Opt in when the column must fill its parent.</dd><dt>padding / margin</dt><dd>Uniform spacing; individual inset props are supported too.</dd></dl></section>
	</ComponentDoc>
)
