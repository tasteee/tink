import { ComponentDoc } from '@app/docs/ComponentDoc'

const img = (label: string, hue: number) =>
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='hsl(${hue} 55% 52%)'/><text x='200' y='220' font-size='72' fill='white' text-anchor='middle' font-family='sans-serif'>${label}</text></svg>`
	)

const set = (n: number) => Array.from({ length: n }, (_, i) => ({ src: img(String(i + 1), (i * 55) % 360), alt: `Image ${i + 1}` }))

export const ZImageMessageDoc = () => (
	<ComponentDoc
		tag="z-image-message"
		category="Chat"
		description="One or more images sent in a message. A single image renders full-width (capped); multiples become an album grid, with a +N overlay past four. Clicking emits open {index, src} (wire to a lightbox). Data-driven via the images property."
	>
		<div className="block">
			<div className="panel">
				<div className="row" style={{ gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
					<z-image-message src={img('1', 200)} alt="One" style={{ width: '220px' }} />
					<z-image-message images={set(2)} style={{ width: '220px' }} />
					<z-image-message images={set(3)} style={{ width: '220px' }} />
					<z-image-message images={set(7)} style={{ width: '220px' }} />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
