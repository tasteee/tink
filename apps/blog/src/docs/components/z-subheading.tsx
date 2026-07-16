import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSubheadingDoc = () => (
	<ComponentDoc tag="z-subheading" category="Foundations" description="A small, letter-spaced text treatment for section eyebrows and compact categories. It gives context before a heading without competing with it.">
		<DocExample title="Introduce a section" description="The eyebrow contextualizes; the heading carries the actual message." code={`<z-column gap="2"><z-subheading color="primary">PROJECT SETTINGS</z-subheading><z-heading size="lg" tag="h1">Billing</z-heading></z-column>`}><z-column gap="2"><z-subheading color="primary">PROJECT SETTINGS</z-subheading><z-heading size="lg" tag="h1">Billing</z-heading></z-column></DocExample>
		<DocExample title="Label an item group" description="A subheading works well when a list has a compact, stable category." code={`<z-column gap="2"><z-subheading size="sm" color="muted">SAVED VIEWS</z-subheading><z-text>My tasks</z-text><z-text>Recently updated</z-text></z-column>`}><z-column gap="2"><z-subheading size="sm" color="muted">SAVED VIEWS</z-subheading><z-text>My tasks</z-text><z-text>Recently updated</z-text></z-column></DocExample>
		<DocExample title="Avoid using it as body copy" description="Its visual treatment is for short labels, not sentences or descriptions." code={`<z-subheading>RELEASE NOTES</z-subheading>
<z-text color="muted">The details belong in normal body text.</z-text>`}><z-column gap="1"><z-subheading>RELEASE NOTES</z-subheading><z-text color="muted" size="sm">The details belong in normal body text.</z-text></z-column></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Props</z-heading><dl><dt>size</dt><dd>Uses the shared text scale; sm is a strong default for compact labels.</dd><dt>color</dt><dd>Muted for secondary grouping, primary for a deliberate accent.</dd><dt>tag</dt><dd>Defaults to p. Use a semantic element only when the label itself needs one.</dd></dl></section>
	</ComponentDoc>
)
