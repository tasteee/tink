import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZCollapsibleDoc = () => (
	<ComponentDoc
		tag="z-collapsible"
		category="Navigation"
		description="A single disclosure for optional, nearby detail. Use z-accordion when several disclosures must coordinate."
	>
		<DocExample
			demo="z-collapsible/reveal-optional-detail"
			title="Reveal optional detail"
			description="Keep the label short and make the hidden content independently useful."
		/>
		<DocExample
			demo="z-collapsible/start-open-or-unavailable"
			title="Start open or unavailable"
			description="is-open sets the initial reflected state. Disabled disclosures remain visible when their content cannot currently be opened."
		/>
		<DocExample
			demo="z-collapsible/listen-for-disclosure-state"
			title="Listen for disclosure state"
			description="The toggle event makes it easy to persist a user preference or update adjacent application state."
		/>
	</ComponentDoc>
)
