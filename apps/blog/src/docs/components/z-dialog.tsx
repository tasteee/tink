import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZDialogDoc = () => (
	<ComponentDoc
		tag="z-dialog"
		category="Overlays"
		description="A focus-trapped modal for a bounded task that must temporarily take priority. Keep the task short and make leaving predictable."
	>
		<DocExample
			demo="z-dialog/structure-an-editing-task"
			title="Structure an editing task"
			description="The trigger opens the dialog. Place the task in the default slot and persistent commits in the footer slot, where they remain visible while content scrolls."
		/>
		<DocExample
			demo="z-dialog/control-state-from-the-application"
			title="Control state from the application"
			description="is-open is reflected. Open and close events let the host coordinate routing, unsaved-change state, or returning focus."
		/>
	</ComponentDoc>
)
