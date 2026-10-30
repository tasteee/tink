import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZBreadcrumbsDoc = () => (
	<ComponentDoc
		tag="z-breadcrumbs"
		category="Navigation"
		description="A compact trail that shows location in a hierarchy. Use it for depth, not as a primary site navigation."
	>
		<DocExample
			demo="z-breadcrumbs/show-the-current-location"
			title="Show the current location"
			description="Link every ancestor and let the final item identify the current page. The last item is current automatically, but is-current makes the intent explicit."
		/>
		<DocExample
			demo="z-breadcrumbs/collapse-a-long-hierarchy"
			title="Collapse a long hierarchy"
			description="max preserves the first crumb and the most local part of a trail, replacing the middle with an ellipsis."
		/>
		<DocExample
			demo="z-breadcrumbs/route-imperatively-when-there-is"
			title="Route imperatively when there is no href"
			description="Crumbs without href emit navigate with the label and original index, so routers can own navigation."
		/>
	</ComponentDoc>
)
