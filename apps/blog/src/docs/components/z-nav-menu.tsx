import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZNavMenuDoc = () => (
	<ComponentDoc
		tag="z-nav-menu"
		category="Navigation"
		description="A horizontal site navigation with links and concise product menus. Keep it shallow and reserve nested menus for closely related destinations."
	>
		<DocExample
			demo="z-nav-menu/mix-links-and-destination-groups"
			title="Mix links and destination groups"
			description="Items with href navigate normally. An item with children opens a menu; child descriptions make similar destinations easier to scan."
		/>
		<DocExample
			demo="z-nav-menu/let-the-router-own-non"
			title="Let the router own non-link selection"
			description="A destination without href emits select. Update the route and the reflected value together so the active item stays correct."
		/>
	</ComponentDoc>
)
