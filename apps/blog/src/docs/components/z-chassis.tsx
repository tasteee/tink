import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZChassisDoc = () => (
	<ComponentDoc
		tag="z-chassis"
		description="A device-like application chassis: a lighter body and rail wrapping a darker, inset screen for the main content."
	>
		<DocExample
			demo="z-chassis/device"
			title="Body, rail, and screen"
			description="slot=sidebar and slot=sidebar-footer fill the rail; everything else is the screen."
		/>
		<DocExample
			demo="z-chassis/expand-on-hover"
			title="Expand on hover"
			description="Hover the rail. Labels fade with --chassis-label-opacity while it’s collapsed. Retheme with --chassis-body, --chassis-screen, and --chassis-border."
		/>
	</ComponentDoc>
)
