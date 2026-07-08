import { DocsLink } from '@app/docs/DocsLink'
import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZBentoItemDoc = () => (
	<ComponentDoc
		tag="z-bento-item"
		category="Layout"
		description="A single cell inside z-bento-grid — always used as its child, never standalone."
	>
		<div className="block">
			<div className="panel">
				<z-text size="sm" color="muted" style={{ display: 'block', marginBottom: '1rem' }}>
					Always rendered inside a &lt;z-bento-grid&gt; — see <DocsLink href="/components/z-bento-grid">that page</DocsLink> for
					the full pattern. Takes <code>col-span</code>/<code>row-span</code> for its footprint, an optional{' '}
					<code>slot="icon"</code> / <code>slot="background"</code>, and an <code>href</code> to reveal a hover CTA.
				</z-text>
				<z-bento-grid columns={2} gap="3" rowHeight="9rem" style={{ maxWidth: '28rem' }}>
					<z-bento-item href="#">
						<z-heading size="xs" tag="h3">
							With a CTA
						</z-heading>
						<z-text size="sm" color="muted">
							Hover to reveal.
						</z-text>
					</z-bento-item>
					<z-bento-item>
						<z-heading size="xs" tag="h3">
							Static cell
						</z-heading>
						<z-text size="sm" color="muted">
							No href, no CTA.
						</z-text>
					</z-bento-item>
				</z-bento-grid>
			</div>
		</div>
	</ComponentDoc>
)
