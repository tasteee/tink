import { Link } from 'wouter'
import { isGroup, sectionById, type DocGroupT, type DocPageT } from '@app/docs/nav'

const flatten = (entries: Array<DocPageT | DocGroupT>): DocPageT[] =>
	entries.flatMap((entry) => (isGroup(entry) ? flatten(entry.items) : [entry]))

// /docs/elements: every listed element, grouped the same way as the sidebar.
export const ElementsIndex = () => {
	const section = sectionById('elements')!
	const groups = section.nav.filter(isGroup)
	const total = flatten(section.nav).length

	return (
		<div className="DocsArticle">
			<z-eyebrow hasRule>Elements</z-eyebrow>
			<h1>Every element, one page each.</h1>
			<p className="DocsLede">
				{total} web components that work in plain HTML, React, Svelte, or anywhere else. Each page pairs live demos with the
				exact code running them, followed by the full API.
			</p>

			<div className="DocsIndexGrid">
				{groups.map((group) => {
					const pages = flatten(group.items)
					return (
						<section key={group.label} className="DocsIndexCard">
							<header>
								<h2>{group.label}</h2>
								<span className="DocsIndexCount">{pages.length}</span>
							</header>
							<ul>
								{pages.map((page) => (
									<li key={page.slug}>
										<Link href={`/elements/${page.slug}`}>{page.label}</Link>
									</li>
								))}
							</ul>
						</section>
					)
				})}
			</div>
		</div>
	)
}
