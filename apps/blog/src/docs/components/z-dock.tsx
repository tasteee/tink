import { ComponentDoc } from '@app/docs/ComponentDoc'

const ICON = (path: string) => (
	<svg viewBox="0 0 24 24" style={{ stroke: 'currentColor', strokeWidth: 1.75, fill: 'none' }}>
		<path d={path} strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

export const ZDockDoc = () => (
	<ComponentDoc
		tag="z-dock"
		category="Navigation"
		description="A macOS-style dock — icons magnify as the pointer nears them. Compose from slotted z-dock-item children."
	>
		<div className="block">
			<div className="panel" style={{ display: 'flex', justifyContent: 'center', paddingBlock: '2.5rem' }}>
				<z-dock magnification={1.8} distance={120}>
					<z-dock-item label="Home">{ICON('M3 12l9-9 9 9M5 10v10h14V10')}</z-dock-item>
					<z-dock-item label="Search">{ICON('M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35')}</z-dock-item>
					<z-dock-item label="Messages" isActive>
						{ICON('M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z')}
					</z-dock-item>
					<z-dock-item label="Files">{ICON('M4 4h6l2 2h8v12H4z')}</z-dock-item>
					<z-dock-item label="Settings">
						{ICON('M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z')}
					</z-dock-item>
				</z-dock>
			</div>
		</div>
	</ComponentDoc>
)
