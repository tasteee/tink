import { ComponentDoc, ComponentPart } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZToolbarDoc = () => (
	<ComponentDoc
		tag="z-toolbar"
		partTags={['z-toolbar-group']}
		category="Actions"
		description="An action strip with toolbar semantics and roving tabindex. Tab enters the bar once; arrow keys move among its enabled controls."
	>
		<DocExample
			demo="z-toolbar/build-a-compact-editor-toolbar"
			title="Build a compact editor toolbar"
			description="Use ghost controls and small gaps so the toolbar reads as one operable surface."
		/>
		<DocExample
			demo="z-toolbar/use-groups-to-name-relationships"
			title="Use groups to name relationships"
			description="Place z-toolbar-group around related controls so assistive technology has useful context."
		/>
		<DocExample
			demo="z-toolbar/choose-the-right-orientation"
			title="Choose the right orientation"
			description="Use vertical only when the toolbar lives in a narrow, persistent rail."
		/>
		<ComponentPart
			tag="z-toolbar-group"
			description="A labeled, tightly spaced cluster inside the toolbar. It keeps related controls together and provides an accessible group name."
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
		</ComponentPart>
	</ComponentDoc>
)
