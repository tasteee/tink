import { ComponentDoc } from '@app/docs/ComponentDoc'

const CONTEXT_MENU_ITEMS = [
	{ value: 'back', label: 'Back', shortcut: '⌘[' },
	{ value: 'forward', label: 'Forward', shortcut: '⌘]' },
	{ isSeparator: true },
	{ value: 'reload', label: 'Reload', shortcut: '⌘R' },
	{ value: 'save', label: 'Save as…', shortcut: '⌘S' },
	{ isSeparator: true },
	{ value: 'delete', label: 'Delete', isDanger: true }
]

export const ZContextMenuDoc = () => (
	<ComponentDoc tag="z-context-menu" category="Overlays" description="A right-click target that opens an items menu at the cursor.">
		<div className="block">
			<div className="panel">
				<z-context-menu items={CONTEXT_MENU_ITEMS}>
					<div style={{ display: 'grid', placeItems: 'center', height: '8rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
						Right-click anywhere in this area
					</div>
				</z-context-menu>
			</div>
		</div>
	</ComponentDoc>
)
