import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZLineDoc = () => (
	<ComponentDoc tag="z-line" category="Foundations" description="A minimal hairline divider. Use it to make an existing relationship easier to scan—not to box every part of the interface.">
		<DocExample title="Divide stacked sections" description="A horizontal line stretches to the width of its containing layout." code={`<z-column gap="3"><z-text>General</z-text><z-line /><z-text>Danger zone</z-text></z-column>`}><z-column gap="3"><z-text>General</z-text><z-line /><z-text>Danger zone</z-text></z-column></DocExample>
		<DocExample title="Separate inline metadata" description="Constrain the vertical line with its container height." code={`<z-row gap="3" aligns-y="center"><z-text>Published</z-text><z-line is-vertical style="height: 1rem" /><z-text color="muted">2 min read</z-text></z-row>`}><z-row gap="3" alignsY="center"><z-text>Published</z-text><z-line isVertical style={{ height: '1rem' }} /><z-text color="muted">2 min read</z-text></z-row></DocExample>
		<DocExample title="Choose the right divider" description="Use z-separator when the break needs a label; use spacing alone when the relationship remains clear." code={`<z-separator label="OR" />
<!-- Use z-line only when an unlabeled rule carries meaning. -->`}><z-separator label="OR" /></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Props</z-heading><dl><dt>is-vertical</dt><dd>Changes direction; provide an explicit height through the surrounding layout or style.</dd><dt>is-horizontal</dt><dd>Forces horizontal direction when needed. Horizontal is the default.</dd><dt>Accessibility</dt><dd>Use a semantic heading or separator label when the division itself must be announced.</dd></dl></section>
	</ComponentDoc>
)
