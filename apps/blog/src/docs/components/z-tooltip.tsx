import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZTooltipDoc = () => (
	<ComponentDoc tag="z-tooltip" category="Overlays" description="A concise hover and focus label for an otherwise ambiguous control. Tooltips explain; they do not carry essential instructions.">
		<DocExample title="Label an icon-only control" description="The control still needs its own accessible name. The tooltip supplies helpful, supplementary context on hover and keyboard focus." code={`<z-tooltip content="Save changes" placement="top">
  <z-button kind="ghost" aria-label="Save">Save</z-button>
</z-tooltip>`}><z-tooltip content="Save changes" placement="top"><z-button kind="ghost" aria-label="Save">Save</z-button></z-tooltip></DocExample>
		<DocExample title="Choose a placement with room" description="Use the closest available side. The floating surface flips near viewport edges, so placement is a preference rather than a guarantee." code={`<z-row gap="3">
  <z-tooltip content="Shown to the right" placement="right"><z-button kind="outline">Right</z-button></z-tooltip>
  <z-tooltip content="Shown below" placement="bottom" tone="primary"><z-button kind="outline">Bottom</z-button></z-tooltip>
</z-row>`}><z-row gap="3"><z-tooltip content="Shown to the right" placement="right"><z-button kind="outline">Right</z-button></z-tooltip><z-tooltip content="Shown below" placement="bottom" tone="primary"><z-button kind="outline">Bottom</z-button></z-tooltip></z-row></DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">UX and API</z-heading><dl><dt>content</dt><dd>Short plain-text help. Do not hide a required action, error, or instruction in a tooltip.</dd><dt>placement</dt><dd>Supports the shared overlay placement values; use the side with the most clear space.</dd><dt>open-delay</dt><dd>Delays hover opening. Keep it brief so intentional discovery feels responsive.</dd><dt>is-disabled</dt><dd>Prevents the tooltip from opening. Use it when the trigger's meaning is already obvious.</dd><dt>Accessibility</dt><dd>It opens on focus as well as hover, but it cannot replace an accessible name on an icon-only button.</dd></dl></section>
	</ComponentDoc>
)
