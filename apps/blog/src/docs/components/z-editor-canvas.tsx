import { useRef } from 'react'
import { ComponentDoc } from '@app/docs/ComponentDoc'
import { DocExample } from '@app/docs/DocExample'

const nodeStyle = { width: '9rem', padding: '1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }

export const ZEditorCanvasDoc = () => {
	const canvas = useRef<HTMLElement & { reset?: () => void; fit?: () => void }>(null)
	return <ComponentDoc tag="z-editor-canvas" category="Layout" description="An infinite canvas for editors, maps, and diagrams. It owns pan and zoom; your children stay in canvas coordinates while overlay content stays fixed to the viewport.">
		<DocExample title="Canvas-space content" description="Drag the empty surface to pan. Use the wheel to zoom toward the cursor." code={`<z-editor-canvas grid="dots" min-zoom="0.5" max-zoom="3">
  <z-canvas-item x="80" y="72"><z-card>Research</z-card></z-canvas-item>
  <z-canvas-item x="320" y="180"><z-card>Launch</z-card></z-canvas-item>
</z-editor-canvas>`}>
			<z-editor-canvas grid="dots" minZoom={0.5} maxZoom={3} style={{ height: '22rem' }}><z-canvas-item x={80} y={72} style={nodeStyle}>Research</z-canvas-item><z-canvas-item x={320} y={180} style={nodeStyle}>Launch</z-canvas-item></z-editor-canvas>
		</DocExample>
		<DocExample title="Use an overlay for controls" description="Overlay content does not move or scale, making it the right place for controls and status." code={`<z-editor-canvas grid="lines">
  <z-canvas-item x="160" y="100">…</z-canvas-item>
  <z-row slot="overlay" gap="2" style="padding: 1rem">
    <z-button>Zoom in</z-button>
    <z-button kind="outline">Reset</z-button>
  </z-row>
</z-editor-canvas>`}>
			<z-editor-canvas ref={canvas as never} grid="lines" style={{ height: '18rem' }}><z-canvas-item x={160} y={100} style={nodeStyle}>Canvas item</z-canvas-item><z-row slot="overlay" gap="2" style={{ padding: '1rem' }}><z-button onClick={() => canvas.current?.fit?.()}>Fit</z-button><z-button kind="outline" onClick={() => canvas.current?.reset?.()}>Reset</z-button></z-row></z-editor-canvas>
		</DocExample>
		<DocExample title="Observe or drive the viewport" description="The reflected viewport attributes make it simple to save state or coordinate an external minimap." code={`const canvas = document.querySelector('z-editor-canvas')
canvas.addEventListener('viewportchange', (event) => {
  saveViewport(event.detail) // { x, y, zoom }
})

canvas.panTo(160, 80)
canvas.zoomTo(1.5)
canvas.fit(32)`}>
			<z-column gap="2"><z-text>Imperative helpers: <code>panTo</code>, <code>panBy</code>, <code>zoomTo</code>, <code>zoomBy</code>, <code>fit</code>, and <code>reset</code>.</z-text><z-text color="muted" size="sm">Coordinate helpers: <code>screenToCanvas</code>, <code>canvasToScreen</code>, and <code>getViewport</code>.</z-text></z-column>
		</DocExample>
		<section className="doc-reference"><z-heading size="xs" tag="h2">Key props and events</z-heading><dl><dt>zoom, pan-x, pan-y</dt><dd>Two-way reflected viewport state.</dd><dt>grid / grid-size / snap</dt><dd>Choose dots or lines and configure the canvas grid.</dd><dt>wheel / pan-button</dt><dd>Use wheel="pan" for trackpad-style panning; pan-button controls pointer panning.</dd><dt>viewportchange</dt><dd>Emits <code>{'{ x, y, zoom }'}</code>; zoomchange and panchange fire for the individual changes.</dd></dl></section>
	</ComponentDoc>
}
