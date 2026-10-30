import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZRadioDoc = () => (
	<ComponentDoc
		tag="z-radio"
		category="Forms"
		description="One exclusive option. Pair radios with z-radio-group whenever a choice is drawn from a visible, mutually exclusive set."
	>
		<DocExample
			demo="z-radio/use-inside-a-named-group"
			title="Use inside a named group"
			description="A radio needs a stable value; the group supplies selection behavior."
		/>
		<DocExample
			demo="z-radio/disable-unavailable-options"
			title="Disable unavailable options"
			description="Keep unavailable choices visible when their absence would be confusing."
		/>
	</ComponentDoc>
)
