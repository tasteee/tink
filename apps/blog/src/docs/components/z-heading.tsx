import { DocsLink } from '@app/docs/DocsLink'
import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZHeadingDoc = () => (
	<ComponentDoc tag="z-heading" category="Foundations" description="Six visual sizes that map to h1–h6 by default. Use tag when visual scale and document-outline level intentionally diverge.">
		<DocExample title="Choose hierarchy before scale" description="The size gives a useful default heading level when visual and semantic hierarchy agree." code={`<z-heading size="xxl">Documentation</z-heading>
<z-heading size="lg">Installation</z-heading>
<z-heading size="sm">Package manager</z-heading>`}><z-column gap="3"><z-heading size="xxl">Documentation</z-heading><z-heading size="lg">Installation</z-heading><z-heading size="sm">Package manager</z-heading></z-column></DocExample>
		<DocExample title="Decouple visual size from document outline" description="Use tag when the page outline requires a different heading level." code={`<z-heading size="lg" tag="h2">A visually large h2</z-heading>
<z-heading size="xs" tag="h3">A compact h3</z-heading>`}><z-column gap="3"><z-heading size="lg" tag="h2">A visually large h2</z-heading><z-heading size="xs" tag="h3">A compact h3</z-heading></z-column></DocExample>
		<DocExample title="Pair titles with body copy" description="Keep a heading short, then put explanation in adjacent z-text." code={`<z-column gap="2"><z-heading size="sm" tag="h2">Invite collaborators</z-heading><z-text color="muted">People with an invite can join this workspace.</z-text></z-column>`}><z-column gap="2"><z-heading size="sm" tag="h2">Invite collaborators</z-heading><z-text color="muted" size="sm">People with an invite can join this workspace.</z-text></z-column></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Props</z-heading><dl><dt>size</dt><dd>xxl, xl, lg, md, sm, or xs. Defaults to md.</dd><dt>tag</dt><dd>Overrides the rendered heading element. Preserve a sensible h1 → h6 document outline.</dd><dt>color / weight</dt><dd>Use color for deliberate accent and weight only when the default hierarchy is insufficient.</dd><dt>Related</dt><dd>Use <DocsLink href="/components/z-subheading">z-subheading</DocsLink> for an eyebrow and <DocsLink href="/components/z-text">z-text</DocsLink> for supporting copy.</dd></dl></section>
	</ComponentDoc>
)
