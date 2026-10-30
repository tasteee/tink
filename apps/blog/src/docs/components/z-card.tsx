import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZCardDoc = () => (
	<ComponentDoc
		tag="z-card"
		category="Foundations"
		description="A bordered grouping for content that needs to read as one object. It brings no shadow or default padding; compose its interior intentionally."
	>
		<DocExample
			demo="z-card/a-compact-project-summary"
			title="A compact project summary"
			description="Use a card when the whole group is one target or one record."
		/>
		<DocExample
			demo="z-card/make-a-card-interactive"
			title="Make a card interactive"
			description="Hover treatment is only for a card whose entire surface is actionable."
		/>
		<DocExample
			demo="z-card/use-plain-layout-for-ordinary"
			title="Use plain layout for ordinary sections"
			description="Do not wrap every related sentence in a card. A heading and spacing are often enough."
		/>
	</ComponentDoc>
)
