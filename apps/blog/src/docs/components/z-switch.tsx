import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSwitchDoc = () => (
	<ComponentDoc
		tag="z-switch"
		category="Forms"
		description="A direct on/off setting. Use it only when the change can take effect immediately; use a checkbox in a submitted form."
	>
		<DocExample
			demo="z-switch/use-for-immediate-settings"
			title="Use for immediate settings"
			description="The label states the current setting, not an action."
		/>
		<DocExample
			demo="z-switch/save-the-new-value-on"
			title="Save the new value on change"
			description="Switches are committed controls, so respond to the event immediately."
		/>
	</ComponentDoc>
)
