import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

export const ZCanvasItemDoc = () => (
	<ComponentDoc tag="z-canvas-item" category="Layout" description="Declarative positioning for content inside z-editor-canvas. It is canvas-space content: its coordinates move and scale with the canvas.">
		<DocExample title="Place an item" description="Coordinates are pixels in the canvas coordinate system, not the viewport." code={`<z-editor-canvas grid="dots">
  <z-canvas-item x="240" y="120" width="160" rotation="-4">
    <z-card>Idea</z-card>
  </z-canvas-item>
</z-editor-canvas>`}>
			<z-editor-canvas grid="dots" style={{ height: '18rem' }}><z-canvas-item x={240} y={120} width={160} rotation={-4}><z-card>Idea</z-card></z-canvas-item></z-editor-canvas>
		</DocExample>
		<DocExample title="Compose a small map" description="Each item remains ordinary content, so use Zest primitives freely inside it." code={`<z-canvas-item x="64" y="64"><z-card>Plan</z-card></z-canvas-item>
<z-canvas-item x="300" y="160"><z-card>Build</z-card></z-canvas-item>
<z-canvas-item x="520" y="64"><z-card>Ship</z-card></z-canvas-item>`}>
			<z-editor-canvas grid="dots" style={{ height: '18rem' }}><z-canvas-item x={64} y={64}><z-card>Plan</z-card></z-canvas-item><z-canvas-item x={300} y={160}><z-card>Build</z-card></z-canvas-item><z-canvas-item x={520} y={64}><z-card>Ship</z-card></z-canvas-item></z-editor-canvas>
		</DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Props</z-heading><dl><dt>x / y</dt><dd>Canvas-space position in pixels.</dd><dt>width / height</dt><dd>Optional item dimensions in pixels.</dd><dt>rotation</dt><dd>Optional clockwise rotation in degrees.</dd></dl></section>
	</ComponentDoc>
)
