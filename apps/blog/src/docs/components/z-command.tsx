import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZCommandDoc = () => (
	<ComponentDoc
		tag="z-command"
		description="A command palette on the native dialog: type to filter, arrows to move, Enter to run. Rows are declarative children or an items array."
	>
		<DocExample
			demo="z-command/group-commands-for-scanning"
			title="Group commands for scanning"
			description="Rows filter by label and keywords and stay grouped. Give every row a stable value so your code can run the chosen command."
		/>
		<DocExample
			demo="z-command/compose-rows"
			title="Compose rows, empty state, and footer"
			description="A z-command-item’s content becomes its row (filtering uses its label attribute, or its text). slot=empty replaces the no-results message; slot=footer adds a hint strip."
		/>
		<DocExample
			demo="z-command/open-from-an-application-shortcut"
			title="Open it from the application"
			description="is-open is two-way, so a button or a global shortcut can open the palette without a slotted trigger."
		/>
		<DocExample
			demo="z-command/dispatch-the-selected-action"
			title="Dispatch the selected action"
			description="The palette closes as it fires select. Route, mutate, or open a more fitting surface from there."
		/>
	</ComponentDoc>
)
