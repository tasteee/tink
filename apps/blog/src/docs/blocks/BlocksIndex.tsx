import { Link } from 'wouter'
import { BLOCKS } from '@app/docs/blocks/blocks'

// /docs/blocks: every recipe, grouped, with its one-line summary.
export const BlocksIndex = () => (
	<div className="DocsArticle">
		<z-eyebrow hasRule>Blocks</z-eyebrow>
		<h1>Recipes, built from elements.</h1>
		<p className="DocsLede">
			Elements are the building blocks. Blocks show how they compose into real interfaces. Every block is plain HTML and a
			little JS: copy it, paste it, make it yours.
		</p>

		{BLOCKS.map((group) => (
			<section key={group.label} className="DocsBlockGroup">
				<h2>{group.label}</h2>
				<div className="DocsIndexGrid">
					{group.items.map((block) => (
						<Link key={block.slug} href={`/blocks/${block.slug}`} className="DocsBlockCard">
							<span className="DocsBlockTitle">{block.title}</span>
							<span className="DocsBlockSummary">{block.summary}</span>
							<span className="DocsBlockMore">View block →</span>
						</Link>
					))}
				</div>
			</section>
		))}
	</div>
)
