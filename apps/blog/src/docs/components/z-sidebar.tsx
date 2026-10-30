import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSidebarDoc = () => (
	<ComponentDoc
		tag="z-sidebar"
		description="A grouped vertical navigation rail for app-level destinations. It owns group disclosure and selection styling; the application owns routing."
	>
		<DocExample
			demo="z-sidebar/app-rail"
			title="Build an app rail"
			description="Header and footer slots stay put while the nav scrolls. Groups nest one level, and items keep the order you give them. The rail fills a parent with a set height; inline, it takes its natural height."
		/>
		<DocExample
			demo="z-sidebar/collapse"
			title="Collapse to an icon rail"
			description="is-collapsed hides labels and keeps each item’s icon. Items without an icon fall back to their first letter."
		/>
		<DocExample
			demo="z-sidebar/docked"
			title="Dock it to an edge"
			description="is-docked drops the card treatment for a rail flush with the page edge, divided by a hairline."
			isStart
		/>
	</ComponentDoc>
)
