import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZComboboxDoc = () => (
	<ComponentDoc
		tag="z-combobox"
		category="Forms"
		description="A searchable single-choice control. Use it when a select’s options are numerous enough that typing is faster than scanning."
	>
		<DocExample
			demo="z-combobox/search-a-known-option-set"
			title="Search a known option set"
			description="Options are an array property, and the field filters by label as people type. z-field supplies the visible and accessible name."
		/>
		<DocExample
			demo="z-combobox/store-the-committed-choice"
			title="Store the committed choice"
			description="The change event reports the chosen option’s stable value."
		/>
	</ComponentDoc>
)
