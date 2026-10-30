import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZToolbarGroupDoc = () => (
	<ComponentDoc
		tag="z-toolbar-group"
		category="Actions"
		description="A labeled, tightly spaced cluster inside z-toolbar. It keeps related controls together and provides an accessible group name."
	>
		<DocExample
			demo="z-toolbar-group/group-related-formatting-controls"
			title="Group related formatting controls"
			description="The label is programmatic context, so it can remain visually quiet."
		/>
		<DocExample
			demo="z-toolbar-group/separate-groups-not-every-control"
			title="Separate groups, not every control"
			description="Use a z-line between meaningful clusters; the group itself supplies the tight spacing."
		/>
	</ComponentDoc>
)
