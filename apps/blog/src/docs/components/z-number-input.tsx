import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZNumberInputDoc = () => (
	<ComponentDoc
		tag="z-number-input"
		category="Forms"
		description="A numeric field with live validation, blur-time clamping, and optional ghost stepper buttons. It aligns with Zest controls at every size."
	>
		<DocExample
			demo="z-number-input/use-bounds-and-a-decimal"
			title="Use bounds and a decimal step"
			description="step, min, and max are numeric properties. Decimal steps work naturally; typed values stay editable and clamp only when the field loses focus."
		/>
		<DocExample
			demo="z-number-input/use-the-compact-size-beside"
			title="Use the compact size beside small buttons"
			description="Small number inputs and small buttons are both 32px tall. The optional controls are ghost buttons within one outlined field."
		/>
		<DocExample
			demo="z-number-input/read-live-validity-commit-corrected"
			title="Read live validity, commit corrected values"
			description="input fires on every keystroke, including invalid intermediate text. change fires after blur or a step action with the normalized numeric value."
		/>
	</ComponentDoc>
)
