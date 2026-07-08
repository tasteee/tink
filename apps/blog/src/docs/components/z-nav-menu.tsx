import { ComponentDoc } from '@app/docs/ComponentDoc'

const NAV_MENU_ITEMS = [
	{ value: 'home', label: 'Home', href: '#' },
	{
		value: 'products',
		label: 'Products',
		children: [
			{ value: 'analytics', label: 'Analytics', description: 'Track everything that moves' },
			{ value: 'automation', label: 'Automation', description: 'Set it and forget it' },
			{ value: 'reports', label: 'Reports', description: 'Numbers, framed' }
		]
	},
	{ value: 'pricing', label: 'Pricing', href: '#' },
	{ value: 'docs', label: 'Docs', href: '#' }
]

export const ZNavMenuDoc = () => (
	<ComponentDoc tag="z-nav-menu" category="Navigation" description="A top-nav menu bar — flat links or nested children with descriptions.">
		<div className="block">
			<div className="panel">
				<z-nav-menu value='products' items={NAV_MENU_ITEMS} />
			</div>
		</div>
	</ComponentDoc>
)
