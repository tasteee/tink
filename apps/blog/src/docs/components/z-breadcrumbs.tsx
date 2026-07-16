import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

const TRAIL = [
	{ label: 'Home', href: '/' },
	{ label: 'Projects', href: '/projects' },
	{ label: 'Aurora', isCurrent: true }
]
const LONG_TRAIL = [
	{ label: 'Home', href: '/' },
	{ label: 'Workspace', href: '/workspace' },
	{ label: 'Projects', href: '/projects' },
	{ label: 'Aurora', href: '/projects/aurora' },
	{ label: 'Settings', isCurrent: true }
]

export const ZBreadcrumbsDoc = () => (
	<ComponentDoc tag="z-breadcrumbs" category="Navigation" description="A compact trail that shows location in a hierarchy. Use it for depth, not as a primary site navigation.">
		<DocExample title="Show the current location" description="Link every ancestor and let the final item identify the current page. The last item is current automatically, but is-current makes the intent explicit." code={`<z-breadcrumbs items={[
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Aurora', isCurrent: true }
]} />`}><z-breadcrumbs items={TRAIL} /></DocExample>
		<DocExample title="Collapse a long hierarchy" description="max preserves the first crumb and the most local part of a trail, replacing the middle with an ellipsis." code={`<z-breadcrumbs max={3} tone="secondary" items={items} />`}><z-breadcrumbs max={3} tone="secondary" items={LONG_TRAIL} /></DocExample>
		<DocExample title="Route imperatively when there is no href" description="Crumbs without href emit navigate with the label and original index, so routers can own navigation." code={`const breadcrumbs = document.querySelector('z-breadcrumbs')
breadcrumbs.addEventListener('navigate', (event) => {
  const { value, index } = event.detail
  router.go(routes[index])
})`} language="ts"><z-breadcrumbs items={[{ label: 'Library' }, { label: 'Albums' }, { label: 'Current', isCurrent: true }]} /></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Guidance</z-heading><dl><dt>items</dt><dd>Assign an array property of <code>{'{ label, href?, isCurrent? }'}</code>; it is not a serialized HTML attribute.</dd><dt>max</dt><dd>Use a positive number to collapse long middle paths. Keep it large enough to preserve useful context.</dd><dt>tone</dt><dd>Use secondary only when the trail belongs to a secondary-branded surface; otherwise use the default accent.</dd><dt>navigate</dt><dd>Fires for a non-current crumb without an href, with <code>{'{ value, index }'}</code> in detail.</dd></dl></section>
	</ComponentDoc>
)
