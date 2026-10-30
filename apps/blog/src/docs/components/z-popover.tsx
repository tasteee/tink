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
	</ComponentDoc>
)
