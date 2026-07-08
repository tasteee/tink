import { DocsLink } from '@app/docs/DocsLink'
import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZDockItemDoc = () => (
	<ComponentDoc
		tag="z-dock-item"
		category="Navigation"
		description="A single icon inside z-dock — always used as its child, never standalone."
	>
		<div className="block">
			<div className="panel">
				<z-text size="sm" color="muted" style={{ display: 'block', marginBottom: '1rem' }}>
					Always rendered inside a &lt;z-dock&gt; — see <DocsLink href="/components/z-dock">that page</DocsLink> for the
					magnification behavior. Takes a <code>label</code> (shown as a tooltip on hover), an optional <code>href</code> to
					render as a link instead of a button, and <code>is-active</code> for the current-page dot.
				</z-text>
				<div className="row" style={{ justifyContent: 'center', paddingBlock: '1.5rem' }}>
					<z-dock>
						<z-dock-item label="Plain">•</z-dock-item>
						<z-dock-item label="Active" isActive>
							•
						</z-dock-item>
						<z-dock-item label="Linked" href="#">
							•
						</z-dock-item>
					</z-dock>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
