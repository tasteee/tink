import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZCanvasItemDoc = () => (
	<ComponentDoc
		tag="z-canvas-item"
		category="Layout"
		description="Declarative positioning for content inside z-editor-canvas. It is canvas-space content: its coordinates move and scale with the canvas."
	>
		<DocExample
			demo="z-canvas-item/place-an-item"
			title="Place an item"
			description="Coordinates are pixels in the canvas coordinate system, not the viewport."
		/>
		<DocExample
			demo="z-canvas-item/compose-a-small-map"
			title="Compose a small map"
			description="Each item remains ordinary content, so use Zest primitives freely inside it."
		/>
	</ComponentDoc>
)
