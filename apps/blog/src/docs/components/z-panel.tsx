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

export const ZPanelDoc = () => (
	<ComponentDoc
		tag="z-panel"
		category="Layout"
		description="A single pane inside z-resizable-panels — declares default-size / min-size / max-size (% or px) and exposes an imperative collapse() / expand() / resize(size) / getSize() / isCollapsed() API on the DOM node."
	>
		<div className="block">
			<z-text size="sm" color="muted" style={{ display: 'block', marginBottom: '1rem' }}>
				Always a child of <DocsLink href="/components/z-resizable-panels">z-resizable-panels</DocsLink>. Set{' '}
				<code className="inline">collapsible</code> + <code className="inline">collapsed-size</code> so a drag past{' '}
				<code className="inline">collapse-threshold</code> snaps the pane shut — try dragging the handle below.
			</z-text>
			<div className="panel" style={{ padding: 0 }}>
				<z-resizable-panels direction="row" style={{ height: '12rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
					<z-panel default-size="24%" min-size="18%" collapsible collapsed-size="0%">
						{pane('Collapsible', 'var(--pink)')}
					</z-panel>
					<z-panel-handle />
					<z-panel min-size="40%">{pane('Content', 'var(--purple)')}</z-panel>
				</z-resizable-panels>
			</div>
		</div>
	</ComponentDoc>
)
