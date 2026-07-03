import type { ReactNode } from 'react'

// Shared chrome for the one-page-per-z-element reference docs. Reuses the
// .DocsPage panel/block/row/col classes from docs.css — only the header is
// bespoke (smaller than the section-index hero, since there are 67 of these).
export const ComponentDoc = ({
	tag,
	category,
	description,
	children
}: {
	tag: string
	category: string
	description?: string
	children: ReactNode
}) => (
	<div className="DocsPage DocsComponentPage">
		<header className="cd-header">
			<z-subheading size="sm" color="primary" style={{ display: 'block', marginBottom: '1rem' }}>
				{category}
			</z-subheading>
			<z-heading size="lg">{tag}</z-heading>

			<div className="dek">
				<z-text size="xl" color="muted">
					{description}
				</z-text>
			</div>
		</header>
		{children}
	</div>
)
