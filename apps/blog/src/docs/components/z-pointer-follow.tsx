import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZPointerFollowDoc = () => (
	<ComponentDoc
		tag="z-pointer-follow"
		category="Specialized"
		description="A custom cursor that trails the pointer, scoped to a wrapped region, or a page-level singleton via `fixed`."
	>
		<DocExample
			demo="z-pointer-follow/scoped-default"
			title="Scoped (default)"
			description="wraps content, tracks the pointer within its own bounds"
		/>
		<DocExample
			demo="z-pointer-follow/fixed-page-level"
			title="Fixed (page-level)"
			description="not demoed inline, it would take over this docs page's cursor"
		/>
	</ComponentDoc>
)
