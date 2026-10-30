import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZMarkdownDoc = () => (
	<ComponentDoc
		tag="z-markdown"
		category="Specialized"
		description="A GFM markdown renderer that composes z-code-block for fenced code, sanitizes dangerous HTML, and hardens external links. Set is-streaming while tokens arrive; the shared renderer behind chat, blog, and docs."
	>
		<DocExample demo="z-markdown/overview" title="Overview" description="" />
		<DocExample demo="z-markdown/overview-2" title="Overview" description="" />
	</ComponentDoc>
)
