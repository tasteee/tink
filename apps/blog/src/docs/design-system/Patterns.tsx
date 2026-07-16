import { DocsLink } from '@app/docs/DocsLink'
import { DocsDemo, DocsFooter, DocsHero, DocsSection } from '@app/docs/DocsChrome'

const TRIGGER_SLOT_CODE = `<z-dialog heading="Edit profile">
  <z-button slot="trigger" kind="solid">Open dialog</z-button>
  {/* default slot = panel content */}
</z-dialog>`

export const Patterns = () => (
	<div className="DocsPage">
		<DocsHero
			eyebrow="DESIGN SYSTEM"
			title="Patterns."
			lede={
				<>
					Common compositions, not new components.{' '}
					<z-inline color="muted" weight="400">
						Every example here is existing z-* elements, arranged.
					</z-inline>
				</>
			}
		/>

		<DocsSection
			id="trigger"
			tone="primary"
			title="The trigger slot"
			sub={
				<>
					Every overlay — <DocsLink href="/components/z-dialog">z-dialog</DocsLink>,{' '}
					<DocsLink href="/components/z-popover">z-popover</DocsLink>, <DocsLink href="/components/z-menu">z-menu</DocsLink>,{' '}
					<DocsLink href="/components/z-sheet">z-sheet</DocsLink>, <DocsLink href="/components/z-tooltip">z-tooltip</DocsLink>,{' '}
					<DocsLink href="/components/z-command">z-command</DocsLink> — shares one anchoring shape: a{' '}
					<code className="inline">slot="trigger"</code> element opens it, default-slotted children are the panel content.
				</>
			}
		>
			<DocsDemo>
				<z-code-block language="tsx" code={TRIGGER_SLOT_CODE} />
			</DocsDemo>
		</DocsSection>

		<DocsSection
			id="form-field"
			tone="secondary"
			title="Labeled field"
			sub={
				<>
					A plain <code className="inline">.field</code> column — a native label plus an input — is all zest expects. It doesn't
					ship a form-field wrapper component; compose one from <code className="inline">z-box</code>.
				</>
			}
		>
			<DocsDemo>
				<z-box isColumn gap="2" style={{ maxWidth: '20rem' }}>
					<z-label size="sm">Email</z-label>
					<z-input type="email" placeholder="you@example.com" />
					<z-text size="xs" color="muted">
						We'll never share this.
					</z-text>
				</z-box>
			</DocsDemo>
		</DocsSection>

		<DocsSection
			id="card-grid"
			tone="primary"
			title="Card grid"
			sub={
				<>
					<code className="inline">z-box isGrid</code> (or <DocsLink href="/components/z-grid">z-grid</DocsLink>) plus{' '}
					<code className="inline">z-card isReactive</code> — the shape behind this site's own doc index cards.
				</>
			}
		>
			<DocsDemo>
				<z-box isGrid columns="2" gap="3">
					<z-card isReactive isColumn gap="2">
						<z-heading size="xs" tag="h3">
							One
						</z-heading>
						<z-text size="sm" color="muted">
							Card content
						</z-text>
					</z-card>
					<z-card isReactive isColumn gap="2">
						<z-heading size="xs" tag="h3">
							Two
						</z-heading>
						<z-text size="sm" color="muted">
							Card content
						</z-text>
					</z-card>
				</z-box>
			</DocsDemo>
		</DocsSection>

		<DocsSection
			id="toolbar"
			tone="secondary"
			title="Toolbar — trailing actions"
			sub={
				<>
					<DocsLink href="/components/z-spacer">z-spacer</DocsLink> <code className="inline">grow</code> inside a row pushes
					everything after it to the far edge — no <code className="inline">margin-left: auto</code> needed.
				</>
			}
		>
			<DocsDemo>
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
			</DocsDemo>
		</DocsSection>

		<DocsSection
			id="destructive-confirm"
			tone="primary"
			title="Destructive confirmation"
			sub={
				<>
					Anything that deletes or can't be undone routes through{' '}
					<DocsLink href="/components/z-alert-dialog">z-alert-dialog</DocsLink> with{' '}
					<code className="inline">tone="danger"</code> — never a bare button with no confirm step.
				</>
			}
		>
			<DocsDemo>
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
			</DocsDemo>
		</DocsSection>

		<DocsFooter
			links={
				<>
					<DocsLink href="/rules">Design rules</DocsLink> · <DocsLink href="/color">Color</DocsLink> ·{' '}
					<DocsLink href="~/">Home</DocsLink>
				</>
			}
		>
			zest · patterns
		</DocsFooter>
	</div>
)
