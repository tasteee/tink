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

		<div className="block">
			<div className="block-title">
				<h3>is-docked</h3>
				<span className="desc">flush rail — no background/border/radius/inline padding, just a hairline trailing border</span>
			</div>
			<div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
				<div className='row' style={{ gap: 0, alignItems: 'stretch', height: '18rem' }}>
					<z-sidebar
						value='dashboard'
						isDocked
						style={{ '--z-sidebar-width': '14rem' } as React.CSSProperties}
						items={SIDEBAR_ITEMS}
					>
						<div slot='header'>
							<z-text weight='lg'>Acme Inc.</z-text>
						</div>
					</z-sidebar>
					<z-surface variant='plain' inset='lg' style={{ flex: 1 }}>
						<z-text size='sm' color='muted'>Position it with your own CSS — e.g. `position: fixed; left: 0` — to dock it to a page edge instead of the container it's demoed in here.</z-text>
					</z-surface>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
