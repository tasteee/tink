import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZAlertDialogDoc = () => (
	<ComponentDoc
		tag="z-alert-dialog"
		category="Overlays"
		description="A focused confirm-or-cancel decision for irreversible or consequential actions. Use it sparingly; routine actions should not require confirmation."
	>
		<DocExample
			demo="z-alert-dialog/confirm-a-destructive-action"
			title="Confirm a destructive action"
			description="Name the object and irreversible outcome. Give the affirmative action a precise verb, and use the danger tone only for genuine destructive work."
		/>
		<DocExample
			demo="z-alert-dialog/perform-the-action-only-after"
			title="Perform the action only after confirm"
			description="confirm and cancel are distinct events. Keep the operation outside the dialog so application state and error handling stay explicit."
		/>
	</ComponentDoc>
)
