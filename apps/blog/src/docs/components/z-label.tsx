import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZLabelDoc = () => (
	<ComponentDoc tag="z-label" category="Foundations" description="A compact UI label with the shared text API. Use a label tag to give form controls an accessible, visible name.">
		<DocExample title="Name a field" description="Reference the visible label with aria-labelledby; this works across the component shadow boundary." code={`<z-column gap="1"><z-label id="email-label">Email address</z-label><z-input aria-labelledby="email-label" type="email" /></z-column>`}><z-column gap="1"><z-label id="email-label">Email address</z-label><z-input aria-labelledby="email-label" placeholder="you@example.com" /></z-column></DocExample>
		<DocExample title="Clarify optionality" description="Put support beside or below the label; never use a placeholder as the only label." code={`<z-column gap="1"><z-row aligns-x="between"><z-label id="website-label">Website</z-label><z-text size="xs" color="muted">Optional</z-text></z-row><z-input aria-labelledby="website-label" /></z-column>`}><z-column gap="1"><z-row alignsX="between"><z-label id="site-demo-label">Website</z-label><z-text size="xs" color="muted">Optional</z-text></z-row><z-input aria-labelledby="site-demo-label" /></z-column></DocExample>
		<DocExample title="Use labels for compact metadata" description="They also work for small field names in a static interface." code={`<z-column gap="1"><z-label size="sm" color="muted">LAST SYNC</z-label><z-text>2 minutes ago</z-text></z-column>`}><z-column gap="1"><z-label size="sm" color="muted">LAST SYNC</z-label><z-text>2 minutes ago</z-text></z-column></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Props</z-heading><dl><dt>tag</dt><dd>Defaults to span. Use it for the semantics of the label text, not external for association.</dd><dt>size / color / weight</dt><dd>Matches the shared text API. Keep labels quieter than values.</dd><dt>Accessibility</dt><dd>Every input needs a programmatic label. Use an id on z-label and aria-labelledby on the control.</dd></dl></section>
	</ComponentDoc>
)
