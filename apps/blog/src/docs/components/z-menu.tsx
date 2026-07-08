import { ComponentDoc } from '@app/docs/ComponentDoc'

const MENU_ITEMS = [
	{ value: 'rename', label: 'Rename', shortcut: '⌘R' },
	{ value: 'duplicate', label: 'Duplicate', shortcut: '⌘D' },
	{ value: 'share', label: 'Share…' },
	{ isSeparator: true },
	{ value: 'delete', label: 'Delete', shortcut: '⌫', isDanger: true }
]

export const ZMenuDoc = () => (
	<ComponentDoc tag="z-menu" category="Navigation" description="A dropdown action menu — items array with separators, shortcuts, and danger styling.">
		<div className="block">
			<div className="panel">
				<div className='row' style={{ gap: '2rem', alignItems: 'flex-start' }}>
					<z-menu items={MENU_ITEMS}>
						<z-button slot='trigger' kind='outline'>Actions ▾</z-button>
					</z-menu>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
