import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZVirtualListDoc = () => (
	<ComponentDoc
		tag="z-virtual-list"
		category="Data Display"
		description="Windowed rendering, only the rows in view (plus overscan) are ever in the DOM, so a list of thousands scrolls cheaply. Headless: set items + a renderItem function that returns a Node or an HTML string."
	>
		<DocExample demo="z-virtual-list/overview" title="Overview" description="" />
		<DocExample demo="z-virtual-list/overview-2" title="Overview" description="" />
	</ComponentDoc>
)
