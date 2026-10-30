import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZHoverCardDoc = () => (
	<ComponentDoc
		tag="z-hover-card"
		category="Overlays"
		description="A delayed, hoverable preview for a link or identity. It enriches a destination without blocking the ordinary click path."
	>
		<DocExample
			demo="z-hover-card/preview-a-profile"
			title="Preview a profile"
			description="Keep the trigger a working link and use the panel for optional identity context, not a second primary interaction."
		/>
		<DocExample
			demo="z-hover-card/tune-for-intentional-hover"
			title="Tune for intentional hover"
			description="A modest open delay avoids flicker while scanning. Leave enough close delay to move the pointer into the preview."
		/>
	</ComponentDoc>
)
