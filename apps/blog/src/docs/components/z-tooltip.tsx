import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZTooltipDoc = () => (
	<ComponentDoc
		tag="z-tooltip"
		description="A concise hover and focus label for an otherwise ambiguous control. Tooltips explain; they never carry essential instructions."
	>
		<DocExample
			demo="z-tooltip/placements"
			title="Placement, tone, and timing"
			description="Hover or focus each control. placement is a preference, not a guarantee: near a viewport edge the tooltip flips to the opposite side, then shifts along its edge to stay on screen (scroll a button to the top of the window to see it flip). Tooltips sit on the inverse surface so they never blend into the UI they explain; tone tints it. Icon-only controls still need their own aria-label."
		/>
	</ComponentDoc>
)
