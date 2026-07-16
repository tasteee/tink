import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZInlineDoc = () => (
	<ComponentDoc tag="z-inline" category="Foundations" description="An inline style patch that inherits surrounding type scale, line height, and font family. Use it for a local emphasis without breaking the sentence rhythm.">
		<DocExample title="Emphasize within a sentence" description="z-inline stays in the parent’s type scale." code={`<z-text size="lg">Your trial ends <z-inline color="primary" weight="600">tomorrow</z-inline>.</z-text>`}><z-text size="lg">Your trial ends <z-inline color="primary" weight="600">tomorrow</z-inline>.</z-text></DocExample>
		<DocExample title="Add a quiet aside" description="Muted inline text is useful for qualifying detail without creating another paragraph." code={`<z-text size="xl">The release is ready <z-inline color="muted">pending one final review</z-inline>.</z-text>`}><z-text size="xl">The release is ready <z-inline color="muted">pending one final review</z-inline>.</z-text></DocExample>
		<DocExample title="Preserve heading rhythm" description="Inline emphasis is preferable to nesting a text component in a heading." code={`<z-heading size="sm" tag="h2">Build <z-inline color="primary">faster</z-inline> with less ceremony</z-heading>`}><z-heading size="sm" tag="h2">Build <z-inline color="primary">faster</z-inline> with less ceremony</z-heading></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Props and constraints</z-heading><dl><dt>color / weight</dt><dd>Adjust only local emphasis. Omitted values inherit from the parent.</dd><dt>is-italic / is-underlined / is-strikethrough</dt><dd>Use as meaningful editorial treatment, not decoration.</dd><dt>tag</dt><dd>Defaults to span. Change it only when the inline element needs semantic meaning.</dd><dt>No size prop</dt><dd>Intentional: z-inline preserves the surrounding typography.</dd></dl></section>
	</ComponentDoc>
)
