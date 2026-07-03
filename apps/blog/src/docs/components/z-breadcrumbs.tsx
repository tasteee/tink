import { ComponentDoc } from '@app/docs/ComponentDoc'
import { withProps } from '@app/docs/withProps'

const BREADCRUMBS = [
	{ label: 'Home', href: '#' },
	{ label: 'Components', href: '#' },
	{ label: 'Navigation', href: '#' },
	{ label: 'Breadcrumbs', isCurrent: true }
]
const BREADCRUMBS_COLLAPSED = [
	{ label: 'Home', href: '#' },
	{ label: 'Workspace', href: '#' },
	{ label: 'Projects', href: '#' },
	{ label: 'Alpha', href: '#' },
	{ label: 'Settings', isCurrent: true }
]

export const ZBreadcrumbsDoc = () => (
	<ComponentDoc tag="z-breadcrumbs" category="Navigation" description="A trail with automatic middle-collapse via `max`.">
		<div className="block">
			<div className="panel">
				<div className='col' style={{ gap: '1.5rem', alignItems: 'flex-start' }}>
					<z-breadcrumbs ref={withProps({ items: BREADCRUMBS })} />
					<z-breadcrumbs max={3} tone='secondary' ref={withProps({ items: BREADCRUMBS_COLLAPSED })} />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
