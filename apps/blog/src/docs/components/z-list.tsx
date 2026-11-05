import { ComponentDoc, ComponentPart } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZListDoc = () => (
	<ComponentDoc
		tag="z-list"
		partTags={['z-list-row']}
		category="Data Display"
		description="A vertical stack of hairline-divided rows on a card surface. Compose with z-list-row, whose second child grows to fill the row."
	>
		<DocExample demo="z-list/rows" title="Rows" description="icon · growing title block · trailing action" />
		<DocExample
			demo="z-list/wrapping-content"
			title="Wrapping content"
			description="is-wrap drops a child onto its own full-width line"
		/>
		<ComponentPart
			tag="z-list-row"
			description="A flexible row for the list. The second slotted child grows by default, keeping leading identity and trailing metadata or actions aligned."
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
		</ComponentPart>
	</ComponentDoc>
)
