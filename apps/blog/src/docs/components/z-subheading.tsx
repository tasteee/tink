import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZSubheadingDoc = () => (
	<ComponentDoc
		tag="z-subheading"
		category="Foundations"
		description="A small, letter-spaced text treatment for section eyebrows and compact categories. It gives context before a heading without competing with it."
	>
		<DocExample
			demo="z-subheading/introduce-a-section"
			title="Introduce a section"
			description="The eyebrow contextualizes; the heading carries the actual message."
		/>
		<DocExample
			demo="z-subheading/label-an-item-group"
			title="Label an item group"
			description="A subheading works well when a list has a compact, stable category."
		/>
		<DocExample
			demo="z-subheading/avoid-using-it-as-body"
			title="Avoid using it as body copy"
			description="Its visual treatment is for short labels, not sentences or descriptions."
		/>
	</ComponentDoc>
)
