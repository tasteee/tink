import { DocsLink } from '@app/docs/DocsLink'
import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZToggleGroupItemDoc = () => (
	<ComponentDoc
		tag="z-toggle-group-item"
		category="Actions"
		description="A single option inside z-toggle-group — always used as its child, never standalone."
	>
		<div className="block">
			<div className="panel">
				<z-text size="sm" color="muted" style={{ display: 'block', marginBottom: '1rem' }}>
					Always rendered inside a &lt;z-toggle-group&gt; — see{' '}
					<DocsLink href="/components/z-toggle-group">that page</DocsLink> for the full pattern. Each item takes a{' '}
					<code>value</code> and an optional <code>isPressed</code> initial state.
				</z-text>
				<div className='row'>
					<z-toggle-group type='single' isOutlined isPurple>
						<z-toggle-group-item value='left'>Left</z-toggle-group-item>
						<z-toggle-group-item value='center' isPressed>Center</z-toggle-group-item>
						<z-toggle-group-item value='right'>Right</z-toggle-group-item>
					</z-toggle-group>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
