import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZDialogDoc = () => (
	<ComponentDoc tag="z-dialog" category="Overlays" description="A focus-trapped modal for a bounded task that must temporarily take priority. Keep the task short and make leaving predictable.">
		<DocExample title="Structure an editing task" description="The trigger opens the dialog. Place the task in the default slot and persistent commits in the footer slot, where they remain visible while content scrolls." code={`<z-dialog heading="Edit profile" description="Update how your profile appears." size="medium">
  <z-button slot="trigger">Edit profile</z-button>
  <z-column gap="3"><z-input label="Display name" value="Ada Lovelace" /></z-column>
  <z-row slot="footer" gap="2" aligns-x="end"><z-button kind="plain">Cancel</z-button><z-button>Save changes</z-button></z-row>
</z-dialog>`}><z-dialog heading="Edit profile" description="Update how your profile appears." size="medium"><z-button slot="trigger">Edit profile</z-button><z-column gap="3"><z-input label="Display name" value="Ada Lovelace" /></z-column><z-row slot="footer" gap="2" alignsX="end"><z-button kind="plain">Cancel</z-button><z-button>Save changes</z-button></z-row></z-dialog></DocExample>
		<DocExample title="Control state from the application" description="is-open is reflected. Open and close events let the host coordinate routing, unsaved-change state, or returning focus." code={`dialog.isOpen = true
dialog.addEventListener('close', () => restoreFocusToTrigger())
dialog.addEventListener('open', () => analytics.track('profile editor opened'))`} language="ts"><z-dialog isDisabled heading="Unavailable"><z-button slot="trigger">Disabled trigger</z-button><z-text>This dialog cannot currently open.</z-text></z-dialog></DocExample>
	</ComponentDoc>
)
