import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZListRowDoc = () => (
	<ComponentDoc
		tag="z-list-row"
		category="Data Display"
		description="A flexible row for z-list. The second slotted child grows by default, keeping leading identity and trailing metadata or actions neatly aligned."
	>
		<DocExample
			demo="z-list-row/build-a-compact-result-row"
			title="Build a compact result row"
			description="Use the first child for an icon or avatar, the second for the primary content, and the last child for metadata or an action."
		/>
		<DocExample
			demo="z-list-row/wrap-secondary-content"
			title="Wrap secondary content"
			description="Give a child class is-wrap to place it on a new full-width line; is-grow opts additional content into the flexible column behavior."
		/>
	</ComponentDoc>
)
