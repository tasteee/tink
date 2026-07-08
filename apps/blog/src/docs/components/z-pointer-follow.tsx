import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZPointerFollowDoc = () => (
	<ComponentDoc
		tag="z-pointer-follow"
		category="Specialized"
		description="A custom cursor that trails the pointer — scoped to a wrapped region, or a page-level singleton via `fixed`."
	>
		<div className="block">
			<div className="block-title">
				<h3>Scoped (default)</h3>
				<span className="desc">wraps content, tracks the pointer within its own bounds</span>
			</div>
			<div className="panel">
				<z-pointer-follow label="Shane" tone="secondary" style={{ display: 'block', width: '100%' }}>
					<div
						style={{
							height: '10rem',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							border: '1px dashed var(--border)',
							borderRadius: 'var(--radius-lg)'
						}}
					>
						<z-text size="sm" color="muted">
							Move your pointer over this panel
						</z-text>
					</div>
				</z-pointer-follow>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Fixed (page-level)</h3>
				<span className="desc">not demoed inline — it would take over this docs page's cursor</span>
			</div>
			<div className="panel">
				<z-code-block language="html" code={'<z-pointer-follow fixed label="You"></z-pointer-follow>'} />
				<z-text size="sm" color="muted" style={{ display: 'block', marginTop: '0.75rem' }}>
					Drop one anywhere in the document with no children. It listens on <code>window</code>, renders a{' '}
					<code>position: fixed</code> dot, and hides the native cursor on <code>document.body</code> until it's removed.
				</z-text>
			</div>
		</div>
	</ComponentDoc>
)
