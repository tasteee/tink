import { ComponentDoc, ComponentPart } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZDockDoc = () => (
	<ComponentDoc
		tag="z-dock"
		partTags={['z-dock-item']}
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
			description="is-floating fixes the dock to the bottom center of the viewport. This preview acts as its own viewport, so the dock floats inside it instead of over the docs."
			isContained
		/>
		<ComponentPart
			tag="z-dock-item"
			description="One labeled icon action inside the dock. The dock supplies magnification and the item supplies semantics."
		>
			<DocExample
				demo="z-dock-item/use-a-label-and-active"
				title="Use a label and active marker"
				description="The label becomes the accessible name and hover tooltip. is-active adds the small current-location marker."
			/>
			<DocExample
				demo="z-dock-item/choose-link-or-command-semantics"
				title="Choose link or command semantics"
				description="href renders a real link. Without it, the item is a button and emits select for application-controlled commands."
			/>
		</ComponentPart>
	</ComponentDoc>
)
