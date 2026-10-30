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
	</ComponentDoc>
)
