import { ComponentDoc } from '@app/docs/ComponentDoc'

const img = (label: string, hue: number) =>
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='120' height='120' fill='hsl(${hue} 55% 55%)'/><text x='60' y='70' font-size='40' fill='white' text-anchor='middle' font-family='sans-serif'>${label}</text></svg>`
	)

export const ZAttachmentChipDoc = () => (
	<ComponentDoc
		tag="z-attachment-chip"
		category="Chat"
		description="A staged file in the composer before send: a thumbnail (or type icon), name and size, and a remove (×) button. An optional progress (0–100) shows an upload bar. Emits remove {value}."
	>
		<div className="block">
			<div className="panel">
				<div className="row" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
					<z-attachment-chip name="proposal.pdf" size="248000" type="application/pdf" />
					<z-attachment-chip name="mockup.png" size="1240000" type="image/png" thumbnail={img('IMG', 280)} />
					<z-attachment-chip name="notes.txt" size="1200" />
					<z-attachment-chip name="upload.zip" size="8400000" progress={62} />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
