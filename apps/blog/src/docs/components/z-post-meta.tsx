import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZPostMetaDoc = () => (
	<ComponentDoc
		tag="z-post-meta"
		category="Specialized"
		description="The byline block rendered by the blog's `!META` markdown marker, author, date, and tags."
	>
		<DocExample demo="z-post-meta/overview" title="Overview" description="" />
	</ComponentDoc>
)
