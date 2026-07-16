import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

const tile = (label: string) => <z-surface className="doc-tile">{label}</z-surface>

export const ZRowDoc = () => (
	<ComponentDoc tag="z-row" category="Layout" description="A direct horizontal layout primitive. Use it for an intentional relationship between siblings, then let wrapping preserve that relationship on narrow screens.">
		<DocExample title="A calm action row" description="Start with the default alignment; add only the spacing the relationship needs." code={`<z-row gap="3" aligns-y="center">
  <z-button>Save changes</z-button>
  <z-button kind="plain">Cancel</z-button>
</z-row>`}>
			<z-row gap="3" alignsY="center"><z-button>Save changes</z-button><z-button kind="plain">Cancel</z-button></z-row>
		</DocExample>
		<DocExample title="Alignment without utility classes" description="aligns-x controls the main (horizontal) axis; aligns-y controls the cross axis." code={`<z-row gap="3" aligns-x="between" aligns-y="center" full-width>
  <z-text>Workspace</z-text>
  <z-badge tone="primary">Private</z-badge>
</z-row>`}>
			<z-row gap="3" alignsX="between" alignsY="center" fullWidth><z-text>Workspace</z-text><z-badge tone="primary">Private</z-badge></z-row>
		</DocExample>
		<DocExample title="Wrap when the contents are peers" description="Use wrap for a collection of equal controls, not to force a page layout to fit." code={`<z-row gap="2" wrap>
  <z-badge>Research</z-badge>
  <z-badge>Design</z-badge>
  <z-badge>Engineering</z-badge>
  <z-badge>Marketing</z-badge>
</z-row>`}>
			<z-row gap="2" wrap><z-badge>Research</z-badge><z-badge>Design</z-badge><z-badge>Engineering</z-badge><z-badge>Marketing</z-badge></z-row>
		</DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Props</z-heading><dl><dt>gap</dt><dd>Token, CSS length, or number between children.</dd><dt>aligns-x / aligns-y</dt><dd>Main- and cross-axis alignment: start, center, end, between, or around.</dd><dt>wrap</dt><dd>Allows children to form new lines.</dd><dt>full-width / full-height</dt><dd>Opt in when the row should fill its parent.</dd><dt>padding / margin</dt><dd>Uniform spacing; inset props are also available for individual sides.</dd></dl></section>
	</ComponentDoc>
)
