import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZPopoverDoc = () => (
	<ComponentDoc
		tag="z-popover"
		category="Overlays"
		description="A click-triggered, non-modal floating panel for compact contextual controls. Use a dialog when the task needs focus or a multi-step decision."
	>
		<DocExample
			demo="z-popover/anchor-compact-controls-to-a"
			title="Anchor compact controls to a trigger"
			description="Place the trigger in its named slot and the panel contents in the default slot. Clicking outside or pressing Escape dismisses the popover."
		/>
		<DocExample
			demo="z-popover/observe-open-state"
			title="Observe open state"
			description="toggle provides the resulting state, useful for analytics or synchronizing nearby UI. It does not turn the component into a modal."
		/>
	</ComponentDoc>
)
