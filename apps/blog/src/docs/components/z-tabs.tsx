import { ComponentDoc } from '@app/docs/ComponentDoc'
import { withProps } from '@app/docs/withProps'

const TABS = [
	{ value: 'overview', label: 'Overview' },
	{ value: 'activity', label: 'Activity' },
	{ value: 'settings', label: 'Settings' },
	{ value: 'billing', label: 'Billing', isDisabled: true }
]

export const ZTabsDoc = () => (
	<ComponentDoc tag="z-tabs" category="Navigation" description="Panels swapped via named slots — no layout shift between tabs.">
		<div className="block">
			<div className="panel">
				<z-tabs value='overview' ref={withProps({ tabs: TABS })}>
					<div slot='overview'>
						<z-text size='sm' color='muted'>Overview — the calm landing surface. Tabs swap the active panel without a layout shift.</z-text>
					</div>
					<div slot='activity'>
						<z-text size='sm' color='muted'>Activity — recent events would stream in here.</z-text>
					</div>
					<div slot='settings'>
						<z-text size='sm' color='muted'>Settings — configuration lives behind this tab.</z-text>
					</div>
				</z-tabs>
			</div>
		</div>
	</ComponentDoc>
)
