import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

const ITEMS = [
	{ value: 'home', label: 'Home', href: '/' },
	{ value: 'products', label: 'Products', children: [
		{ value: 'analytics', label: 'Analytics', description: 'Track the work that matters' },
		{ value: 'automation', label: 'Automation', description: 'Make repeatable work disappear' }
	] },
	{ value: 'pricing', label: 'Pricing', href: '/pricing' }
]

export const ZNavMenuDoc = () => (
	<ComponentDoc tag="z-nav-menu" category="Navigation" description="A horizontal site navigation with links and concise product menus. Keep it shallow and reserve nested menus for closely related destinations.">
		<DocExample title="Mix links and destination groups" description="Items with href navigate normally. An item with children opens a menu; child descriptions make similar destinations easier to scan." code={`<z-nav-menu value="products" items={[
  { value: 'home', label: 'Home', href: '/' },
  { value: 'products', label: 'Products', children: [
    { value: 'analytics', label: 'Analytics', description: 'Track the work that matters' }
  ] }
]} />`}><z-nav-menu value="products" items={ITEMS} /></DocExample>
		<DocExample title="Let the router own non-link selection" description="A destination without href emits select. Update the route and the reflected value together so the active item stays correct." code={`nav.addEventListener('select', (event) => {
  const value = event.detail.value
  router.navigate('/' + value)
  nav.value = value
})`} language="ts"><z-nav-menu tone="secondary" value="products" items={[{ value: 'library', label: 'Library' }, { value: 'create', label: 'Create' }]} /></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Guidance</z-heading><dl><dt>items</dt><dd>Assign top-level <code>{'{ value?, label, href?, children? }[]'}</code>. Children may include <code>description</code>.</dd><dt>value</dt><dd>Set this to the active top-level value. It indicates location; it does not navigate by itself.</dd><dt>href versus select</dt><dd>Use href for normal links. Omit it for application-controlled navigation and listen for select.</dd><dt>Menu depth</dt><dd>Keep one nested level. If a visitor must drill further, use a landing page or sidebar instead.</dd></dl></section>
	</ComponentDoc>
)
