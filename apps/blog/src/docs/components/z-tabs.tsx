import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZTabsDoc = () => (
	<ComponentDoc
		tag="z-tabs"
		description="A local view switcher with keyboard navigation. Use tabs for peer views that change in place, not as a route substitute."
	>
		<DocExample
			demo="z-tabs/compound"
			title="Tabs with their panels"
			description="Declare each tab as a z-tab, and give each panel a slot named after its tab’s value. Only the active panel renders, wired up as the tabpanel."
		/>
		<DocExample
			demo="z-tabs/controller"
			title="Tabs as a controller"
			description="Leave out the panels and z-tabs is just the tablist: read value or listen for change, and render the content anywhere in your layout."
		/>
		<DocExample
			demo="z-tabs/fitted"
			title="Fitted tabs for a short, fixed set"
			description="is-fitted splits a known, short set evenly across the available width."
		/>
		<DocExample
			demo="z-tabs/react-to-changes"
			title="React to the selection"
			description="change carries the selected value, e.g. to sync the URL or load data. Disabled tabs are skipped by arrow-key navigation."
		/>
	</ComponentDoc>
)
