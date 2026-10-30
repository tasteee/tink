import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

const ITEMS = [
	{ value: 'rename', label: 'Rename', shortcut: 'âŒ˜R' },
	{ value: 'duplicate', label: 'Duplicate', shortcut: 'âŒ˜D' },
	{ isSeparator: true },
	{ value: 'delete', label: 'Delete', isDanger: true }
]

export const ZMenuDoc = () => (
	<ComponentDoc tag="z-menu" category="Navigation" description="A compact menu of commands for one object. Put infrequent actions here, while keeping the primary action visible.">
		<DocExample title="Collect object actions" description="Slot any practical trigger, then provide an items array. Separators create meaningful groups; danger makes irreversible actions easy to spot." code={`<z-menu items={[
  { value: 'rename', label: 'Rename', shortcut: 'âŒ˜R' },
  { value: 'duplicate', label: 'Duplicate' },
  { isSeparator: true },
  { value: 'delete', label: 'Delete', isDanger: true }
]}>
  <z-button slot="trigger" kind="outline">More actions</z-button>
</z-menu>`}><z-menu items={ITEMS}><z-button slot="trigger" kind="outline">More actions</z-button></z-menu></DocExample>
		<DocExample title="Align to the trigger edge" description="Use end when the trigger sits at the right edge of a card or toolbar so the panel stays inside the available surface." code={`<z-menu align="end" tone="secondary" items={items}>
  <z-button slot="trigger" kind="ghost" aria-label="Project actions">â€¢â€¢â€¢</z-button>
</z-menu>`}><z-row style={{ width: '100%' }} alignsX="end"><z-menu align="end" tone="secondary" items={ITEMS}><z-button slot="trigger" kind="ghost" aria-label="Project actions">â€¢â€¢â€¢</z-button></z-menu></z-row></DocExample>
		<DocExample title="Handle the selected command" description="The element closes itself before emitting select, leaving the application responsible for the command outcome and any confirmation." code={`menu.addEventListener('select', (event) => {
  switch (event.detail.value) {
    case 'rename': openRenameDialog(); break
    case 'delete': openDeleteConfirmation(); break
  }
})`} language="ts"><z-menu items={[{ value: 'share', label: 'Share link' }, { value: 'archive', label: 'Archive', isDisabled: true }]}><z-button slot="trigger" kind="soft">Project</z-button></z-menu></DocExample>
	</ComponentDoc>
)
