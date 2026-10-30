import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZBadgeDoc = () => (
	<ComponentDoc
		tag="z-badge"
		category="Data Display"
		description="Pills and inline status, soft, solid, outline kinds; selectable and removable variants."
	>
		<DocExample demo="z-badge/tints-kinds" title="Tints & kinds" description="" />
		<DocExample demo="z-badge/interactive" title="Interactive" description="selectable & removable tags" />
	</ComponentDoc>
)
