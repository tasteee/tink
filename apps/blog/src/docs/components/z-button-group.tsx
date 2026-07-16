import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZButtonGroupDoc = () => (
	<ComponentDoc tag="z-button-group" category="Actions" description="A seamless row or column of adjacent buttons. Use it for neighboring actions that act on the same object—not for selection state.">
		<DocExample title="Keep sibling actions together" description="The group removes visual seams while preserving each button as a separate action." code={`<z-button-group><z-button kind="outline">Duplicate</z-button><z-button kind="outline">Archive</z-button><z-button kind="outline">Delete</z-button></z-button-group>`}><z-button-group><z-button kind="outline">Duplicate</z-button><z-button kind="outline">Archive</z-button><z-button kind="outline">Delete</z-button></z-button-group></DocExample>
		<DocExample title="Use a vertical group for a compact tool rail" description="Vertical composition is useful when a narrow inspector needs several sibling commands." code={`<z-button-group is-vertical><z-button kind="ghost">Move</z-button><z-button kind="ghost">Duplicate</z-button><z-button kind="ghost">Delete</z-button></z-button-group>`}><z-button-group isVertical><z-button kind="ghost">Move</z-button><z-button kind="ghost">Duplicate</z-button><z-button kind="ghost">Delete</z-button></z-button-group></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Guidance</z-heading><dl><dt>is-vertical</dt><dd>Stacks direct button children vertically.</dd><dt>Use toggle group for modes</dt><dd>Button group executes separate commands; z-toggle-group represents one or more selected values.</dd><dt>Children</dt><dd>Use adjacent z-button elements with a consistent kind and size.</dd></dl></section>
	</ComponentDoc>
)
