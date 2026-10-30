import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZEditorCanvasDoc = () => (
	<ComponentDoc
		tag="z-editor-canvas"
		description="An infinite canvas for editors, maps, and diagrams. It owns pan and zoom; children stay in canvas coordinates while overlay content stays fixed to the viewport."
	>
		<DocExample
			demo="z-editor-canvas/canvas-space-content"
			title="Canvas-space content"
			description="Drag the empty surface to pan. Use the wheel to zoom toward the cursor."
		/>
		<DocExample
			demo="z-editor-canvas/overlay-controls"
			title="Use an overlay for controls"
			description="slot=overlay content doesn’t move or scale, so it’s the place for controls and status."
		/>
		<DocExample
			demo="z-editor-canvas/viewport"
			title="Observe or drive the viewport"
			description="viewportchange reports { x, y, zoom }. panTo, panBy, zoomTo, zoomBy, fit, and reset drive it; screenToCanvas and canvasToScreen convert coordinates."
		/>
	</ComponentDoc>
)
