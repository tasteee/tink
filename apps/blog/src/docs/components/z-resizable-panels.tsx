import { ComponentDoc } from '@app/docs/ComponentDoc'

const pane = (label: string, tint: string) => (
	<div
		style={{
			height: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			background: `color-mix(in oklch, ${tint} 12%, transparent)`,
			fontFamily: 'var(--font-mono)',
			fontSize: '0.8125rem',
			color: 'var(--muted-foreground)'
		}}
	>
		{label}
	</div>
)

export const ZResizablePanelsDoc = () => (
	<ComponentDoc
		tag="z-resizable-panels"
		category="Layout"
		description="A react-resizable-panels-style group — author z-panel children separated by z-panel-handle and drag to resize. Sizes take % or px (min-size == max-size makes a fixed pane), and auto-save-id persists the layout to localStorage."
	>
		<div className="block">
			<div className="panel" style={{ padding: 0 }}>
				<z-resizable-panels direction="row" style={{ height: '16rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
					<z-panel default-size="20%" min-size="120px">{pane('Sidebar', 'var(--purple)')}</z-panel>
					<z-panel-handle />
					<z-panel min-size="30%">{pane('Editor', 'var(--pink)')}</z-panel>
					<z-panel-handle />
					<z-panel default-size="25%" min-size="160px" max-size="40%">{pane('Inspector', 'var(--purple)')}</z-panel>
				</z-resizable-panels>
			</div>
		</div>

		<div className="block">
			<h3>Collapsible pane</h3>
			<div className="panel" style={{ padding: 0 }}>
				<z-resizable-panels direction="row" style={{ height: '12rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
					<z-panel default-size="22%" min-size="18%" collapsible collapsed-size="0%" collapse-threshold="10%">
						{pane('Drag me shut', 'var(--pink)')}
					</z-panel>
					<z-panel-handle />
					<z-panel min-size="40%">{pane('Content', 'var(--purple)')}</z-panel>
				</z-resizable-panels>
			</div>
		</div>
	</ComponentDoc>
)
