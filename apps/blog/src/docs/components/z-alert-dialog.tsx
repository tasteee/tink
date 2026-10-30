import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZAlertDialogDoc = () => (
	<ComponentDoc tag="z-alert-dialog" category="Overlays" description="A focused confirm-or-cancel decision for irreversible or consequential actions. Use it sparingly; routine actions should not require confirmation.">
		<DocExample title="Confirm a destructive action" description="Name the object and irreversible outcome. Give the affirmative action a precise verb, and use the danger tone only for genuine destructive work." code={`<z-alert-dialog tone="danger" heading="Delete project?" description="This permanently removes Aurora and its data." confirm-label="Delete project" cancel-label="Keep project">
  <z-button slot="trigger" kind="outline" tone="danger">Delete</z-button>
</z-alert-dialog>`}><z-alert-dialog tone="danger" heading="Delete project?" description="This permanently removes Aurora and its data." confirmLabel="Delete project" cancelLabel="Keep project"><z-button slot="trigger" kind="outline" tone="danger">Delete</z-button></z-alert-dialog></DocExample>
		<DocExample title="Perform the action only after confirm" description="confirm and cancel are distinct events. Keep the operation outside the dialog so application state and error handling stay explicit." code={`dialog.addEventListener('confirm', async () => {
  await deleteProject(projectId)
})
dialog.addEventListener('cancel', () => analytics.track('delete cancelled'))`} language="ts"><z-alert-dialog heading="Publish changes?" description="The update will be visible immediately." confirmLabel="Publish"><z-button slot="trigger" kind="outline">Publish</z-button></z-alert-dialog></DocExample>
	</ComponentDoc>
)
