import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZFieldDoc = () => (
	<ComponentDoc
		tag="z-field"
		category="Forms"
		description="The standard label, guidance, and error wrapper for one Zest form control. It supplies visible context and forwards its label to the slotted Zest control as its accessible name."
	>
		<DocExample
			demo="z-field/use-z-field-for-ordinary"
			title="Use z-field for ordinary form controls"
			description="A form control needs a stable name. z-field keeps that name visible and passes it to the control inside its shadow DOM."
		/>
		<DocExample
			demo="z-field/use-the-same-pattern-for"
			title="Use the same pattern for choices and longer answers"
			description="The wrapper works with select, combobox, textarea, and other Zest form controls, not just text inputs."
		/>
		<DocExample
			demo="z-field/make-required-state-and-errors"
			title="Make required state and errors clear"
			description="Use the required marker to set expectation. Replace supporting guidance with the specific next action when validation fails."
		/>
		<DocExample
			demo="z-field/hide-a-label-only-when"
			title="Hide a label only when context is already visible"
			description="Compact or repeated controls can omit visible text, but must still have an accessible name. is-label-hidden keeps the wrapper label available to assistive technology."
		/>
		<DocExample
			demo="z-field/use-label-directly-for-compact"
			title="Use label directly for compact contextual controls"
			description="When surrounding UI already makes the purpose obvious, skip z-field and give the control its accessible label directly. A placeholder is never its label."
		/>
	</ComponentDoc>
)
