import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZPostMetaDoc = () => (
	<ComponentDoc
		tag="z-post-meta"
		category="Specialized"
		description="The byline block rendered by the blog's `!META` markdown marker — author, date, and tags."
	>
		<div className="block">
			<div className="panel">
				<z-text size="sm" color="muted" style={{ display: 'block', marginBottom: '1rem' }}>
					Normally emitted automatically by the blog's <code>!META</code> markdown marker (see{' '}
					<code>apps/blog/src/markdown/renderMarkdown.ts</code>) — rendered here directly for reference.
				</z-text>
				<z-post-meta name='Ada Lovelace' date='March 12, 2026' tags={['design-systems', 'web-components']} />
			</div>
		</div>
	</ComponentDoc>
)
