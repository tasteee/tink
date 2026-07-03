import { DocsLink } from '@app/docs/DocsLink'
import { withProps } from '@app/docs/withProps'

const TRIGGER_SLOT_CODE = `<z-dialog heading="Edit profile">
  <z-button slot="trigger" kind="solid">Open dialog</z-button>
  {/* default slot = panel content */}
</z-dialog>`

export const Patterns = () => (
	<div className="DocsPage">
		<header className="hero">
			<div className="eyebrow">
				<span>DESIGN SYSTEM</span>
				<span className="line" />
			</div>
			<h1>Patterns.</h1>
			<p className="lede">
				Common compositions, not new components. <span className="muted">Every example here is existing z-* elements, arranged.</span>
			</p>
		</header>

		<section className="section" id="trigger">
			<div className="section-head">
				<span className="dot purple" />
				<h2>The trigger slot</h2>
			</div>
			<p className="section-sub">
				Every overlay — <DocsLink href="/components/z-dialog">z-dialog</DocsLink>,{' '}
				<DocsLink href="/components/z-popover">z-popover</DocsLink>, <DocsLink href="/components/z-menu">z-menu</DocsLink>,{' '}
				<DocsLink href="/components/z-sheet">z-sheet</DocsLink>, <DocsLink href="/components/z-tooltip">z-tooltip</DocsLink>,{' '}
				<DocsLink href="/components/z-command">z-command</DocsLink> — shares one anchoring shape: a{' '}
				<code className="inline">slot="trigger"</code> element opens it, default-slotted children are the panel content.
			</p>
			<div className="panel">
				<z-code-block language="tsx" ref={withProps({ code: TRIGGER_SLOT_CODE })} />
			</div>
		</section>

		<section className="section" id="form-field">
			<div className="section-head">
				<span className="dot pink" />
				<h2>Labeled field</h2>
			</div>
			<p className="section-sub">
				A plain <code className="inline">.field</code> column — a native label plus an input — is all zest expects. It doesn't
				ship a form-field wrapper component; compose one from <code className="inline">z-box</code>.
			</p>
			<div className="panel">
				<z-box isColumn gap="2" style={{ maxWidth: '20rem' }}>
					<z-label size="sm">Email</z-label>
					<z-input type="email" placeholder="you@example.com" />
					<z-text size="xs" color="muted">
						We'll never share this.
					</z-text>
				</z-box>
			</div>
		</section>

		<section className="section" id="card-grid">
			<div className="section-head">
				<span className="dot purple" />
				<h2>Card grid</h2>
			</div>
			<p className="section-sub">
				<code className="inline">z-box isGrid</code> (or <DocsLink href="/components/z-grid">z-grid</DocsLink>) plus{' '}
				<code className="inline">z-card doesLightUpOnHover</code> — the shape behind this site's own doc index cards.
			</p>
			<div className="panel">
				<z-box isGrid columns="2" gap="3">
					<z-card doesLightUpOnHover isColumn gap="2">
						<z-heading size="xs" tag="h3">
							One
						</z-heading>
						<z-text size="sm" color="muted">
							Card content
						</z-text>
					</z-card>
					<z-card doesLightUpOnHover isColumn gap="2">
						<z-heading size="xs" tag="h3">
							Two
						</z-heading>
						<z-text size="sm" color="muted">
							Card content
						</z-text>
					</z-card>
				</z-box>
			</div>
		</section>

		<section className="section" id="toolbar">
			<div className="section-head">
				<span className="dot pink" />
				<h2>Toolbar — trailing actions</h2>
			</div>
			<p className="section-sub">
				<DocsLink href="/components/z-spacer">z-spacer</DocsLink> <code className="inline">grow</code> inside a row pushes
				everything after it to the far edge — no <code className="inline">margin-left: auto</code> needed.
			</p>
			<div className="panel">
				<z-stack isRow gap="sm" alignsY="center">
					<z-heading size="xs" tag="h3">
						Project Alpha
					</z-heading>
					<z-spacer grow />
					<z-button kind="outline" size="small">
						Cancel
					</z-button>
					<z-button tone="primary" kind="solid" size="small">
						Save
					</z-button>
				</z-stack>
			</div>
		</section>

		<section className="section" id="destructive-confirm">
			<div className="section-head">
				<span className="dot purple" />
				<h2>Destructive confirmation</h2>
			</div>
			<p className="section-sub">
				Anything that deletes or can't be undone routes through{' '}
				<DocsLink href="/components/z-alert-dialog">z-alert-dialog</DocsLink> with{' '}
				<code className="inline">tone="danger"</code> — never a bare button with no confirm step.
			</p>
			<div className="panel">
				<z-alert-dialog
					tone="danger"
					heading="Delete project?"
					description="This permanently removes the project and all of its data."
					confirmLabel="Delete"
				>
					<z-button slot="trigger" kind="outline" tone="danger">
						Delete…
					</z-button>
				</z-alert-dialog>
			</div>
		</section>

		<footer className="docs-footer">
			<span>zest · patterns</span>
			<span>
				<DocsLink href="/rules">Design rules</DocsLink> · <DocsLink href="/color">Color</DocsLink> · <DocsLink href="~/">Home</DocsLink>
			</span>
		</footer>
	</div>
)
