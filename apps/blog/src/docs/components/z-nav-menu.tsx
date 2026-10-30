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
	</ComponentDoc>
)
