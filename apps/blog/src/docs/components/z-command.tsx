import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

const ITEMS = [
	{ group: 'Navigation', value: 'projects', label: 'Go to Projects', shortcut: 'G P', keywords: 'work' },
	{ group: 'Navigation', value: 'settings', label: 'Go to Settings', shortcut: 'G S' },
	{ group: 'Actions', value: 'new', label: 'New Project', shortcut: 'Ctrl+N', keywords: 'create add' },
	{ group: 'Actions', value: 'invite', label: 'Invite teammate', keywords: 'member user' }
]

export const ZCommandDoc = () => (
	<ComponentDoc tag="z-command" category="Overlays" description="A searchable command palette for fast, well-known application actions. It supplements visible navigation and controls; it does not replace them.">
		<DocExample title="Group commands for scanning" description="Items are filtered by label and keywords, then grouped. Give every item a stable value so application code can perform the selected command." code={`<z-command placeholder="Type a command or search" items={[
  { group: 'Navigation', value: 'projects', label: 'Go to Projects', shortcut: 'G P', keywords: 'work' },
  { group: 'Actions', value: 'new', label: 'New Project', keywords: 'create add' }
]}>
  <z-button slot="trigger" kind="outline">Open command palette</z-button>
</z-command>`}><z-command placeholder="Type a command or search" items={ITEMS}><z-button slot="trigger" kind="outline">Open command palette</z-button></z-command></DocExample>
		<DocExample title="Open from an application shortcut" description="is-open is reflected, so a global keyboard shortcut can open the palette without inventing a second command surface." code={`window.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    command.isOpen = true
  }
})`} language="ts"><z-text size="sm" color="muted">Avoid intercepting a shortcut already essential to the host platform or browser.</z-text></DocExample>
		<DocExample title="Dispatch the selected action" description="The palette closes before emitting select. Route, mutate, or open a more appropriate surface from the host." code={`command.addEventListener('select', (event) => {
  const { value } = event.detail
  if (value === 'new') openNewProjectDialog()
  else router.navigate('/' + value)
})`} language="ts"><z-command emptyText="No matching commands" items={ITEMS}><z-button slot="trigger" kind="outline">Try search</z-button></z-command></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">UX and API</z-heading><dl><dt>items</dt><dd>Assign <code>{'{ group?, value?, label, shortcut?, keywords?, isDisabled? }[]'}</code> as an array property.</dd><dt>is-open, open, close</dt><dd>Reflected state and bubbling lifecycle events. Opening clears the query and focuses search.</dd><dt>select</dt><dd>Bubbling event with <code>{'{ value }'}</code> after an enabled result is selected.</dd><dt>placeholder / empty-text</dt><dd>Set concise search guidance and an honest empty result state.</dd><dt>Keyboard</dt><dd>Arrow keys move through enabled results, Enter selects, and Escape closes. Keep shortcuts visible when they are meaningful.</dd><dt>Choice</dt><dd>Use for frequent commands and navigation. Do not hide the only way to discover a critical feature in the palette.</dd></dl></section>
	</ComponentDoc>
)
