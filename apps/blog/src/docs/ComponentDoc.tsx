import type { ReactNode } from 'react'
import { ApiReference } from '@app/docs/ApiReference'
import { elementGroupOf } from '@app/docs/nav'

type ComponentDocPropsT = {
	tag: string
	category?: string
	description?: string
	// Child elements documented on this page instead of their own.
	partTags?: string[]
	children: ReactNode
}

type ComponentPartPropsT = {
	tag: string
	description: string
	children: ReactNode
}

// A child element (z-list-row, z-dock-item…) documented inside its
// parent's page: its own heading, summary, and examples.
export const ComponentPart = (props: ComponentPartPropsT) => (
	<section className="DocsPart" aria-label={`${props.tag} element`}>
		<h2 className="DocsPartTag">{props.tag}</h2>
		<p className="DocsPartSummary">{props.description}</p>
		{props.children}
	</section>
)

// Shared chrome for the one-page-per-z-element reference docs: a compact
// header (group eyebrow, tag, summary), the live examples, then the API.
export const ComponentDoc = (props: ComponentDocPropsT) => {
	const groupLabel = elementGroupOf(props.tag) ?? props.category
	const partTags = props.partTags ?? []

	return (
		<div className="DocsArticle DocsComponentPage">
			<header className="DocsElementHeader">
				<z-eyebrow hasRule>{groupLabel}</z-eyebrow>
				<h1 className="DocsElementTag">{props.tag}</h1>
				{props.description && <p className="DocsLede">{props.description}</p>}
			</header>
			{props.children}
			<ApiReference tag={props.tag} />
			{partTags.map((partTag) => (
				<ApiReference key={partTag} tag={partTag} heading={`${partTag} API`} />
			))}
		</div>
	)
}
