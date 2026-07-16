import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSeparatorDoc = () => (
	<ComponentDoc tag="z-separator" category="Foundations" description="A hairline divider with optional text at its center. It gives an explicit transition a little more voice than z-line.">
		<DocExample title="Separate alternative actions" description="A label makes the relationship between two action paths clear." code={`<z-column gap="3"><z-button>Continue with email</z-button><z-separator label="OR CONTINUE WITH" /><z-button kind="outline">Continue with Google</z-button></z-column>`}><z-column gap="3" style={{ maxWidth: '22rem' }}><z-button>Continue with email</z-button><z-separator label="OR CONTINUE WITH" /><z-button kind="outline">Continue with Google</z-button></z-column></DocExample>
		<DocExample title="Create a labeled document break" description="Keep labels short and structural, not explanatory." code={`<z-column gap="3"><z-text>Recent activity</z-text><z-separator label="EARLIER" /><z-text color="muted">No activity before this date.</z-text></z-column>`}><z-column gap="3"><z-text>Recent activity</z-text><z-separator label="EARLIER" /><z-text color="muted">No activity before this date.</z-text></z-column></DocExample>
		<DocExample title="Use an unlabeled separator sparingly" description="When no label is needed, z-line is usually the quieter choice." code={`<z-separator />
<!-- Prefer <z-line /> for a neutral visual divider. -->`}><z-separator /></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Props</z-heading><dl><dt>label</dt><dd>Optional centered text. Use concise, structural wording.</dd><dt>is-vertical</dt><dd>Renders a vertical separator for compact layouts.</dd><dt>is-hidden</dt><dd>Removes the separator from layout.</dd></dl></section>
	</ComponentDoc>
)
