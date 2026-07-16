import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZPopoverDoc = () => (
	<ComponentDoc tag="z-popover" category="Overlays" description="A click-triggered, non-modal floating panel for compact contextual controls. Use a dialog when the task needs focus or a multi-step decision.">
		<DocExample title="Anchor compact controls to a trigger" description="Place the trigger in its named slot and the panel contents in the default slot. Clicking outside or pressing Escape dismisses the popover." code={`<z-popover placement="bottom-start" tone="primary">
  <z-button slot="trigger" kind="outline">View details</z-button>
  <z-column gap="2">
    <z-heading size="xs">Dimensions</z-heading>
    <z-text size="sm" color="muted">24 x 16 x 8 cm</z-text>
  </z-column>
</z-popover>`}><z-popover placement="bottom-start" tone="primary"><z-button slot="trigger" kind="outline">View details</z-button><z-column gap="2"><z-heading size="xs">Dimensions</z-heading><z-text size="sm" color="muted">24 x 16 x 8 cm</z-text></z-column></z-popover></DocExample>
		<DocExample title="Observe open state" description="toggle provides the resulting state, useful for analytics or synchronizing nearby UI. It does not turn the component into a modal." code={`popover.addEventListener('toggle', (event) => {
  if (event.detail.open) analytics.track('details opened')
})`} language="ts"><z-popover placement="bottom" isDisabled><z-button slot="trigger" kind="outline">Unavailable</z-button><z-text>Unavailable panels do not open.</z-text></z-popover></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">UX and API</z-heading><dl><dt>Slots</dt><dd>Use one <code>slot="trigger"</code> child and place the panel body in the default slot.</dd><dt>placement</dt><dd>Use shared placement values such as <code>bottom-start</code>. The panel flips when necessary.</dd><dt>toggle</dt><dd>Bubbling event with <code>{'{ open }'}</code> after the trigger or dismissal changes state.</dd><dt>is-disabled</dt><dd>Stops the trigger from opening the panel; explain unavailable controls outside the popover.</dd><dt>Choice</dt><dd>Use for short contextual content. Do not place a destructive confirmation or essential form inside it.</dd></dl></section>
	</ComponentDoc>
)
