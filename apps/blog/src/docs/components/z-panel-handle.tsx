import { DocsLink } from '@app/docs/DocsLink'
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

export const ZPanelHandleDoc = () => (
	<ComponentDoc
		tag="z-panel-handle"
		category="Layout"
		description="The draggable separator between two z-panel siblings. Pointer-drag moves the boundary; ←/→ (or ↑/↓ in a column group) resize by the group's keyboard-step. Renders a hairline grip by default — slot in your own separator and it stays the drag target."
	>
		<div className="block">
			<z-text size="sm" color="muted" style={{ display: 'block', marginBottom: '1rem' }}>
				Always a direct child of <DocsLink href="/components/z-resizable-panels">z-resizable-panels</DocsLink>,
				alternating with <code className="inline">z-panel</code>. Focus a handle and press an arrow key to resize by
				keyboard.
			</z-text>
			<div className="panel" style={{ padding: 0 }}>
				<z-resizable-panels direction="row" style={{ height: '10rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
					<z-panel default-size="50%">{pane('Left', 'var(--purple)')}</z-panel>
					<z-panel-handle />
					<z-panel default-size="50%">{pane('Right', 'var(--pink)')}</z-panel>
				</z-resizable-panels>
			</div>
		</div>

		<div className="block">
			<h3>Custom separator</h3>
			<div className="panel" style={{ padding: 0 }}>
				<z-resizable-panels direction="row" style={{ height: '10rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
					<z-panel default-size="50%">{pane('Left', 'var(--purple)')}</z-panel>
					<z-panel-handle style={{ width: '1.5rem', background: 'var(--card)' }}>
						<div style={{ width: '3px', height: '1.5rem', borderRadius: '999px', background: 'var(--border)' }} />
					</z-panel-handle>
					<z-panel default-size="50%">{pane('Right', 'var(--pink)')}</z-panel>
				</z-resizable-panels>
			</div>
		</div>
	</ComponentDoc>
)
