import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZContextMenuDoc = () => (
	<ComponentDoc
		tag="z-context-menu"
		category="Overlays"
		description="A cursor-anchored menu for secondary actions on the object under the pointer. Always provide a discoverable non-context-menu path to essential actions."
	>
		<DocExample
			demo="z-context-menu/attach-actions-to-an-object"
			title="Attach actions to an object"
			description="Wrap the target, then add z-menu-item rows (the same rows z-menu takes). Separators group related commands; danger identifies destructive work."
		/>
		<DocExample
			demo="z-context-menu/perform-the-command-in-the"
			title="Perform the command in the host"
			description="select fires after the picked row flashes. Confirm destructive actions with z-alert-dialog rather than acting immediately."
		/>
	</ComponentDoc>
)
