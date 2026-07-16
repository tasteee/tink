import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

const ITEMS = [{ value: 'rename', label: 'Rename', shortcut: 'Ctrl+R' }, { value: 'duplicate', label: 'Duplicate' }, { isSeparator: true }, { value: 'delete', label: 'Delete', isDanger: true }]

export const ZContextMenuDoc = () => (
	<ComponentDoc tag="z-context-menu" category="Overlays" description="A cursor-anchored menu for secondary actions on the object under the pointer. Always provide a discoverable non-context-menu path to essential actions.">
		<DocExample title="Attach actions to an object" description="Wrap the target in the context menu and assign item definitions. Separators group related commands; danger identifies destructive work." code={`<z-context-menu items={items}>
  <article>Right-click this project card</article>
</z-context-menu>`}><z-context-menu items={ITEMS}><div style={{ display: 'grid', placeItems: 'center', minHeight: '8rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--muted-foreground)' }}>Right-click this project card</div></z-context-menu></DocExample>
		<DocExample title="Perform the command in the host" description="select identifies the command. Confirm destructive actions with z-alert-dialog rather than acting immediately." code={`menu.addEventListener('select', (event) => {
  if (event.detail.value === 'delete') openDeleteConfirmation()
  if (event.detail.value === 'rename') openRenameDialog()
})`} language="ts"><z-context-menu tone="secondary" isDisabled items={ITEMS}><z-text size="sm" color="muted">Disabled targets retain their normal pointer behavior.</z-text></z-context-menu></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">UX and API</z-heading><dl><dt>items</dt><dd>Assign the same menu-item shape as z-menu: values, labels, optional shortcuts, separators, disabled, and danger states.</dd><dt>select</dt><dd>Bubbling event with <code>{'{ value }'}</code> for the chosen enabled row.</dd><dt>tone</dt><dd>Use an accent tone only when it belongs to the containing surface; danger is per item.</dd><dt>is-disabled</dt><dd>Disables context-menu handling for the wrapped target.</dd><dt>Discoverability</dt><dd>Context menus are an accelerator. Mirror important commands in a visible menu or toolbar for touch and unfamiliar users.</dd></dl></section>
	</ComponentDoc>
)
