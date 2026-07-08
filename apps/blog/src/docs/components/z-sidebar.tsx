import { ComponentDoc } from '@app/docs/ComponentDoc'

const SIDEBAR_ITEMS = [
	{
		label: 'Main',
		items: [
			{ value: 'dashboard', label: 'Dashboard' },
			{ value: 'projects', label: 'Projects', badge: '4' },
			{ value: 'tasks', label: 'Tasks' }
		]
	},
	{
		label: 'Account',
		items: [
			{ value: 'team', label: 'Team' },
			{ value: 'settings', label: 'Settings' }
		]
	}
]
const SIDEBAR_COLLAPSED = [
	{ value: 'dashboard', label: 'Dashboard' },
	{ value: 'projects', label: 'Projects' },
	{ value: 'tasks', label: 'Tasks' },
	{ value: 'team', label: 'Team' },
	{ value: 'settings', label: 'Settings' }
]

export const ZSidebarDoc = () => (
	<ComponentDoc tag="z-sidebar" category="Navigation" description="A grouped vertical navigation rail — this exact page's own sidebar, in fact.">
		<div className="block">
			<div className="panel">
				<div className='row' style={{ gap: '1.5rem', alignItems: 'stretch', height: '22rem' }}>
					<z-sidebar value='dashboard' style={{ '--z-sidebar-width': '15rem' } as React.CSSProperties} items={SIDEBAR_ITEMS}>
						<div slot='header'>
							<z-text weight='lg'>Acme Inc.</z-text>
						</div>
						<div slot='footer'>
							<z-text size='xs' color='muted'>v0.1.0 · WIP</z-text>
						</div>
					</z-sidebar>
					<z-sidebar value='dashboard' tone='secondary' isCollapsed items={SIDEBAR_COLLAPSED} />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
