import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZDockDoc = () => (
	<ComponentDoc
		tag="z-dock"
		description="A pointer-responsive icon dock for a very small set of high-frequency destinations. It is app chrome, not a substitute for a full navigation model."
	>
		<DocExample
			demo="z-dock/compose-with-dock-items"
			title="Compose with dock items"
			description="The dock owns restrained magnification; each child owns its label, action, and active indicator. Give every icon a label."
		/>
		<DocExample
			demo="z-dock/tune-the-physical-footprint"
			title="Tune the physical footprint"
			description="Magnification is capped at a subtle 12% and eases off further when items sit close together. item-size and gap accept CSS sizes."
		/>
		<DocExample
			demo="z-dock/floating"
			title="Float it"
			description="floating fixes the dock to the bottom center of the viewport. This preview acts as its own viewport, so the dock floats inside it instead of over the docs."
			isContained
		/>
	</ComponentDoc>
)
