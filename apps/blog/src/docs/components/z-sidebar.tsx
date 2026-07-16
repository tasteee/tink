import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

const ITEMS = [{ label: 'Workspace', items: [{ value: 'projects', label: 'Projects', badge: '4' }, { value: 'tasks', label: 'Tasks' }] }, { value: 'settings', label: 'Settings' }]

export const ZSidebarDoc = () => (
	<ComponentDoc tag="z-sidebar" category="Navigation" description="A grouped vertical navigation rail for app-level destinations. It owns group disclosure and selection styling; the application owns routing.">
		<DocExample title="Build a durable app rail" description="Groups are sorted alphabetically by label. Header and footer slots stay fixed while the navigation area scrolls in a bounded-height layout." code={`<z-sidebar value="projects" items={items} style={{ height: '22rem' }}>
  <strong slot="header">Acme</strong>
  <span slot="footer">Signed in as Maya</span>
</z-sidebar>`}><div style={{ height: '20rem' }}><z-sidebar value="projects" items={ITEMS}><z-text slot="header" weight="lg">Acme</z-text><z-text slot="footer" size="xs" color="muted">Signed in as Maya</z-text></z-sidebar></div></DocExample>
		<DocExample title="Collapse or dock the rail" description="Collapsed hides labels while preserving icons or initial-letter fallbacks. Docked removes the card treatment for a rail flush with a page edge." code={`<z-sidebar is-collapsed items={items} />
<z-sidebar is-docked items={items} style={{ height: '100vh' }} />`}><z-row gap="4" style={{ height: '14rem' }}><z-sidebar isCollapsed items={ITEMS} /><z-sidebar isDocked tone="secondary" value="tasks" items={ITEMS} /></z-row></DocExample>
		<DocExample title="Synchronize selection with routing" description="Use href for ordinary navigation, or handle select for application-owned routes. Keep value synchronized with the current route." code={`sidebar.addEventListener('select', (event) => {
  const value = event.detail.value
  router.navigate('/app/' + value)
  sidebar.value = value
})`} language="ts"><z-sidebar style={{ height: '10rem' }} items={[{ value: 'inbox', label: 'Inbox' }, { value: 'archive', label: 'Archive' }]} /></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Guidance</z-heading><dl><dt>items</dt><dd>Use links or groups: <code>{'{ value, label, href?, icon?, badge? }'}</code>, or <code>{'{ label, items }'}</code>.</dd><dt>value and select</dt><dd>value marks the active item. A non-link item emits select with <code>{'{ value }'}</code>.</dd><dt>Height</dt><dd>Give the host or an ancestor a bounded height when using header/footer, so only the navigation section scrolls.</dd><dt>is-collapsed / is-docked</dt><dd>Collapse for compact app chrome; dock only when the rail should sit flush against a page edge.</dd></dl></section>
	</ComponentDoc>
)
