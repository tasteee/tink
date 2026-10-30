import type { ReactNode } from 'react'
import { ApiReference } from '@app/docs/ApiReference'
import { elementGroupOf } from '@app/docs/nav'

// Shared chrome for the one-page-per-z-element reference docs: a compact
// header (group eyebrow, tag, summary), the live examples, then the API.
export const ComponentDoc = ({
	tag,
	category,
	description,
	children
}: {
	tag: string
	category?: string
	description?: string
	children: ReactNode
}) => (
	<div className="DocsArticle DocsComponentPage">
		<header className="DocsElementHeader">
			<z-eyebrow hasRule>{elementGroupOf(tag) ?? category}</z-eyebrow>
			<h1 className="DocsElementTag">{tag}</h1>
			{description && <p className="DocsLede">{description}</p>}
		</header>
		{children}
		<ApiReference tag={tag} />
	</div>
)
