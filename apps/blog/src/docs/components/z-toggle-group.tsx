import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZToggleGroupDoc = () => (
	<ComponentDoc tag="z-toggle-group" category="Actions" description="Coordinates pressed state across z-toggle-group-item children. Use it for modes, filters, and formatting choices with one or many active values.">
		<DocExample title="Choose one mode" description="Single selection makes the current mode obvious and ensures only one item remains pressed." code={`<z-toggle-group type="single" is-outlined><z-toggle-group-item value="list" is-pressed>List</z-toggle-group-item><z-toggle-group-item value="grid">Grid</z-toggle-group-item></z-toggle-group>`}><z-toggle-group type="single" isOutlined><z-toggle-group-item value="list" isPressed>List</z-toggle-group-item><z-toggle-group-item value="grid">Grid</z-toggle-group-item></z-toggle-group></DocExample>
		<DocExample title="Select several formatting options" description="Multiple selection leaves every item independent while reporting the full selected-value array." code={`<z-toggle-group type="multiple" is-outlined><z-toggle-group-item value="bold">Bold</z-toggle-group-item><z-toggle-group-item value="italic" is-pressed>Italic</z-toggle-group-item><z-toggle-group-item value="underline">Underline</z-toggle-group-item></z-toggle-group>`}><z-toggle-group type="multiple" isOutlined><z-toggle-group-item value="bold">Bold</z-toggle-group-item><z-toggle-group-item value="italic" isPressed>Italic</z-toggle-group-item><z-toggle-group-item value="underline">Underline</z-toggle-group-item></z-toggle-group></DocExample>
		<DocExample title="Persist the group selection" description="Listen at the group, rather than attaching separate state handlers to every item." code={`group.addEventListener('change', (event) => {
  const value = event.detail.value // string for single, string[] for multiple
  saveSelection(value)
})`}><z-text color="muted">The <code>change</code> event is bubbling and composed, so it works across application boundaries.</z-text></DocExample>
	</ComponentDoc>
)
