import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

const SECTION = (value: string, label: string, content: string, isOpen?: boolean) => <z-collapsible value={value} label={label} isOpen={isOpen}>{content}</z-collapsible>

export const ZAccordionDoc = () => (
	<ComponentDoc tag="z-accordion" category="Navigation" description="A bordered set of disclosures. Choose single-open for focused FAQs and multiple-open when comparing answers matters.">
		<DocExample title="Keep one answer in focus" description="Single is the default: opening one z-collapsible closes its siblings." code={`<z-accordion type="single">
  <z-collapsible value="shipping" label="Shipping" is-open>Ships in two business days.</z-collapsible>
  <z-collapsible value="returns" label="Returns">Returns accepted for 30 days.</z-collapsible>
</z-accordion>`}><z-accordion type="single">{SECTION('shipping', 'Shipping', 'Ships in two business days.', true)}{SECTION('returns', 'Returns', 'Returns accepted for 30 days.')}{SECTION('warranty', 'Warranty', 'One year of coverage.')}</z-accordion></DocExample>
		<DocExample title="Allow comparison" description="Use multiple when readers may need several specifications or answers open at the same time." code={`<z-accordion type="multiple">
  <z-collapsible label="Dimensions" is-open>24 Ã— 16 Ã— 8 cm</z-collapsible>
  <z-collapsible label="Materials" is-open>Recycled aluminum</z-collapsible>
</z-accordion>`}><z-accordion type="multiple">{SECTION('dimensions', 'Dimensions', '24 Ã— 16 Ã— 8 cm', true)}{SECTION('materials', 'Materials', 'Recycled aluminum', true)}</z-accordion></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Guidance</z-heading><dl><dt>Children</dt><dd>Use direct <code>z-collapsible</code> children; the accordion supplies the shared border treatment and coordination.</dd><dt>type</dt><dd><code>single</code> (default) keeps one item open. <code>multiple</code> leaves each child independent.</dd><dt>Initial state</dt><dd>Set <code>is-open</code> on the child or children that should begin expanded.</dd><dt>Content density</dt><dd>Keep each answer concise. If the content needs its own page, link to it instead of hiding a full article here.</dd></dl></section>
	</ComponentDoc>
)
