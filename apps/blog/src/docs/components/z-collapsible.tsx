import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZCollapsibleDoc = () => (
	<ComponentDoc tag="z-collapsible" category="Navigation" description="A single disclosure for optional, nearby detail. Use z-accordion when several disclosures must coordinate.">
		<DocExample title="Reveal optional detail" description="Keep the label short and make the hidden content independently useful." code={`<z-collapsible label="What is Zest?" is-open>
  A border-first web component library for dark interfaces.
</z-collapsible>`}><z-collapsible label="What is Zest?" isOpen>A border-first web component library for dark interfaces.</z-collapsible></DocExample>
		<DocExample title="Start open or unavailable" description="is-open sets the initial reflected state. Disabled disclosures remain visible when their content cannot currently be opened." code={`<z-column gap="1">
  <z-collapsible label="Release notes" is-open>Latest changesâ€¦</z-collapsible>
  <z-collapsible label="Enterprise settings" is-disabled>Admin access required.</z-collapsible>
</z-column>`}><z-column gap="1"><z-collapsible label="Release notes" isOpen>Latest changes are ready to review.</z-collapsible><z-collapsible label="Enterprise settings" isDisabled>Admin access required.</z-collapsible></z-column></DocExample>
		<DocExample title="Listen for disclosure state" description="The toggle event makes it easy to persist a user preference or update adjacent application state." code={`panel.addEventListener('toggle', (event) => {
  const { value, open } = event.detail
  saveDisclosureState(value, open)
})`} language="ts"><z-collapsible value="details" tone="primary" label="Implementation details">The event includes this value and whether the section is open.</z-collapsible></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Guidance</z-heading><dl><dt>label or trigger slot</dt><dd>Use label for simple text. Supply <code>slot="trigger"</code> for richer trigger content.</dd><dt>is-open</dt><dd>Reflected open state. The trigger exposes it through <code>aria-expanded</code>.</dd><dt>value and toggle</dt><dd>Give coordinated disclosures a value; toggle emits <code>{'{ value, open }'}</code>.</dd><dt>is-disabled</dt><dd>Prevents toggling. Prefer explaining why the detail is unavailable in nearby text.</dd></dl></section>
	</ComponentDoc>
)
