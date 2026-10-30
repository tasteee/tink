import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZMenuDoc = () => (
	<ComponentDoc
		tag="z-menu"
		description="A dropdown of commands for an object or view. Picking a row confirms it with a quick double flash, then the menu closes and fires select."
	>
		<DocExample
			demo="z-menu/collect-object-actions"
			title="Collect object actions"
			description="Slot any trigger, then write the rows as z-menu-item children. Separators group related commands; is-danger makes irreversible actions easy to spot."
		/>
		<DocExample
			demo="z-menu/rich-rows"
			title="Compose rich rows"
			description="A z-menu-item’s own content becomes its row: icons, avatars, badges, anything."
		/>
		<DocExample
			demo="z-menu/align-to-the-trigger-edge"
			title="Align to the trigger edge"
			description="Use align=end when the trigger sits at the right edge of a card or toolbar, so the panel stays inside the surface."
		/>
		<DocExample
			demo="z-menu/handle-the-selected-command"
			title="Handle the selected command"
			description="select fires once the picked row has flashed, as the menu closes. Whatever the command opens (a dialog, a route) arrives after the menu has visibly confirmed the choice. Keyboard picks (Enter/Space) behave the same."
		/>
		<DocExample
			demo="z-menu/from-data"
			title="Or drive it from data"
			description="For data-driven menus, set the items array instead of writing children."
		/>
	</ComponentDoc>
)
