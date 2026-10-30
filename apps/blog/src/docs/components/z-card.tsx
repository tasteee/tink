import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZCardDoc = () => (
	<ComponentDoc tag="z-card" category="Foundations" description="A bordered grouping for content that needs to read as one object. It brings no shadow or default padding; compose its interior intentionally.">
		<DocExample title="A compact project summary" description="Use a card when the whole group is one target or one record." code={`<z-card is-flex is-column gap="3" style="padding: 1.25rem">
  <z-row aligns-x="between"><z-badge>Active</z-badge><z-text color="muted">2 min ago</z-text></z-row>
  <z-heading size="xs" tag="h3">Project Alpha</z-heading>
  <z-text color="muted">A concise status summary.</z-text>
</z-card>`}>
			<z-card isFlex isColumn gap="3" style={{ padding: '1.25rem', maxWidth: '28rem' }}><z-row alignsX="between"><z-badge>Active</z-badge><z-text color="muted" size="xs">2 min ago</z-text></z-row><z-heading size="xs" tag="h3">Project Alpha</z-heading><z-text color="muted" size="sm">A concise status summary belongs with the record it describes.</z-text></z-card>
		</DocExample>
		<DocExample title="Make a card interactive" description="Hover treatment is only for a card whose entire surface is actionable." code={`<z-card is-reactive is-flex is-column gap="2" style="padding: 1.25rem">
  <z-heading size="xs">Open project</z-heading>
  <z-text color="muted">Navigate to Project Alpha.</z-text>
</z-card>`}>
			<z-card isReactive isFlex isColumn gap="2" style={{ padding: '1.25rem', maxWidth: '28rem', cursor: 'pointer' }}><z-heading size="xs">Open project</z-heading><z-text color="muted" size="sm">Hover is reserved for a whole-card action.</z-text></z-card>
		</DocExample>
		<DocExample title="Use plain layout for ordinary sections" description="Do not wrap every related sentence in a card. A heading and spacing are often enough." code={`<z-column gap="2">
  <z-heading size="xs">Notes</z-heading>
  <z-text color="muted">This is page content, not an independent object.</z-text>
</z-column>`}><z-column gap="2"><z-heading size="xs">Notes</z-heading><z-text color="muted" size="sm">This is page content, not an independent object.</z-text></z-column></DocExample>
	</ComponentDoc>
)
