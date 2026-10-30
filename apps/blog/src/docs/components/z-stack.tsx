import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZStackDoc = () => (
	<ComponentDoc
		tag="z-stack"
		category="Layout"
		description="A flexible one-dimensional layout primitive. Stack related content vertically by default, then opt into a row only when the relationship is genuinely horizontal."
	>
		<DocExample
			demo="z-stack/keep-a-reading-group-together"
			title="Keep a reading group together"
			description="A vertical stack expresses a connected sequence without adding a visual container."
		/>
		<DocExample
			demo="z-stack/switch-the-axis-deliberately"
			title="Switch the axis deliberately"
			description="is-row turns the same spacing and alignment API into a horizontal relationship."
		/>
		<DocExample
			demo="z-stack/distribute-a-bounded-region"
			title="Distribute a bounded region"
			description="Use main-axis distribution only when the stack owns a meaningful height."
		/>
	</ComponentDoc>
)
