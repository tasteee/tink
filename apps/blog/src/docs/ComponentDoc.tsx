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
			<span className="cd-eyebrow">{category}</span>
			<h1 className="cd-title">&lt;{tag}&gt;</h1>
			{description && <p className="cd-desc">{description}</p>}
		</header>
		{children}
	</div>
)
