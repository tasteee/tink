import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZColorPickerDoc = () => (
	<ComponentDoc
		tag="z-color-picker"
		category="Forms"
		description="A hex color control with a swatch trigger. Use it where people meaningfully choose a color, not as decorative page chrome."
	>
		<DocExample
			demo="z-color-picker/choose-a-brand-color"
			title="Choose a brand color"
			description="Value is a hex string and can be persisted from the change event."
		/>
		<DocExample
			demo="z-color-picker/offer-sensible-presets"
			title="Offer sensible presets"
			description="Presets make common choices fast without blocking a custom value."
		/>
	</ComponentDoc>
)
