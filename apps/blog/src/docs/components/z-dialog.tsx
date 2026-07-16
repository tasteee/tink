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
		<section className="doc-reference"><z-heading size="xs" tag="h2">UX and API</z-heading><dl><dt>Slots</dt><dd>Use <code>trigger</code> to open, the default slot for the task, and <code>footer</code> for persistent actions.</dd><dt>heading / description</dt><dd>State the task and any consequence clearly. Use a sentence description when it materially helps completion.</dd><dt>size</dt><dd>Choose the smallest size that comfortably fits the task. Wider dialogs are not a substitute for a dedicated page.</dd><dt>is-open, open, close</dt><dd>is-open is reflected; open and close are bubbling lifecycle events.</dd><dt>Dismissal</dt><dd>Escape, the close button, and backdrop dismiss by default. Use <code>is-static</code> only when abandoning would lose important work.</dd></dl></section>
	</ComponentDoc>
)
