import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZHoverCardDoc = () => (
	<ComponentDoc tag="z-hover-card" category="Overlays" description="A delayed, hoverable preview for a link or identity. It enriches a destination without blocking the ordinary click path.">
		<DocExample title="Preview a profile" description="Keep the trigger a working link and use the panel for optional identity context, not a second primary interaction." code={`<z-hover-card placement="bottom" open-delay={200} close-delay={150}>
  <z-link slot="trigger" href="/people/ada">@ada</z-link>
  <z-row gap="3" aligns-y="center">
    <z-avatar name="Ada Lovelace" />
    <z-column gap="1"><z-text weight="lg">Ada Lovelace</z-text><z-text size="sm" color="muted">Engineering</z-text></z-column>
  </z-row>
</z-hover-card>`}><z-hover-card placement="bottom" openDelay={200} closeDelay={150}><z-link slot="trigger" href="#ada">@ada</z-link><z-row gap="3" alignsY="center"><z-avatar name="Ada Lovelace" /><z-column gap="1"><z-text weight="lg">Ada Lovelace</z-text><z-text size="sm" color="muted">Engineering</z-text></z-column></z-row></z-hover-card></DocExample>
		<DocExample title="Tune for intentional hover" description="A modest open delay avoids flicker while scanning. Leave enough close delay to move the pointer into the preview." code={`<z-hover-card open-delay={250} close-delay={200}>...</z-hover-card>`}><z-text size="sm" color="muted">Use delays to reduce accidental opens; do not use hover cards for information users must be able to reach on touch.</z-text></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">UX and API</z-heading><dl><dt>Slots</dt><dd>Put the link or identity trigger in <code>slot="trigger"</code>; use the default slot for preview content.</dd><dt>open-delay / close-delay</dt><dd>Delay hover state in milliseconds. A short close delay allows travel from trigger to card.</dd><dt>placement</dt><dd>Uses shared floating placement and flips near viewport edges.</dd><dt>Touch and keyboard</dt><dd>Make the destination available without hover. A hover card is enrichment, never the only route to required content.</dd></dl></section>
	</ComponentDoc>
)
