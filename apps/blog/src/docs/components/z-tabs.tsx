import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

const TABS = [{ value: 'overview', label: 'Overview' }, { value: 'activity', label: 'Activity' }, { value: 'settings', label: 'Settings' }]

export const ZTabsDoc = () => (
	<ComponentDoc tag="z-tabs" category="Navigation" description="A local view switcher with keyboard navigation. Use tabs for peer panels that can change in place, not as a route substitute.">
		<DocExample title="Pair every tab with a named panel" description="tabs is an array property; each panel's slot must match its tab value. Only the active panel is rendered." code={`<z-tabs value="overview" tabs={[
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity' }
]}>
  <div slot="overview">Project summary</div>
  <div slot="activity">Recent activity</div>
</z-tabs>`}><z-tabs value="overview" tabs={TABS}><z-text slot="overview" size="sm" color="muted">Project summary and current status.</z-text><z-text slot="activity" size="sm" color="muted">Recent activity appears here.</z-text><z-text slot="settings" size="sm" color="muted">Local project settings.</z-text></z-tabs></DocExample>
		<DocExample title="Use fitted tabs for a bounded control" description="Fitted tabs split a known, short set evenly across the available width. Do not use it for a long or variable list." code={`<z-tabs is-fitted tone="secondary" value="overview" tabs={tabs}>â€¦</z-tabs>`}><z-tabs isFitted tone="secondary" value="overview" tabs={TABS}><z-text slot="overview" size="sm" color="muted">Equal-width overview.</z-text><z-text slot="activity" size="sm" color="muted">Equal-width activity.</z-text><z-text slot="settings" size="sm" color="muted">Equal-width settings.</z-text></z-tabs></DocExample>
		<DocExample title="React to the selected panel" description="change provides the selected value so applications can synchronize URL state, data loading, or local state." code={`tabs.addEventListener('change', (event) => {
  const { value } = event.detail
  history.replaceState(null, '', '?panel=' + value)
})`} language="ts"><z-tabs value="overview" tabs={[...TABS, { value: 'billing', label: 'Billing', isDisabled: true }]}><z-text slot="overview" size="sm">A disabled tab is skipped by arrow-key navigation.</z-text></z-tabs></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Guidance</z-heading><dl><dt>tabs</dt><dd>Assign <code>{'{ value, label, isDisabled? }[]'}</code> as a property, then provide a matching named slot for each panel.</dd><dt>value and change</dt><dd>value is the active tab. Selecting a tab emits <code>{'{ value }'}</code> in a bubbling change event.</dd><dt>Keyboard</dt><dd>Left and Right arrows move between enabled tabs; Home and End jump to the first and last.</dd><dt>When to use</dt><dd>Tabs work best for a small set of related panels. Use links for destinations that need independent URLs and browser history.</dd></dl></section>
	</ComponentDoc>
)
