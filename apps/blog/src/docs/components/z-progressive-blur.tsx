import { ComponentDoc } from '@app/docs/ComponentDoc'

const IMG =
	'data:image/svg+xml;utf8,' +
	encodeURIComponent(
		`<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420'>
			<defs>
				<linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>
					<stop offset='0%' stop-color='hsl(255 55% 62%)'/>
					<stop offset='100%' stop-color='hsl(310 60% 68%)'/>
				</linearGradient>
			</defs>
			<rect width='640' height='420' fill='url(#sky)'/>
			<polygon points='0,420 140,220 260,340 420,180 640,420' fill='hsl(230 40% 30%)'/>
			<polygon points='0,420 220,300 380,420' fill='hsl(230 45% 22%)'/>
			<circle cx='500' cy='90' r='46' fill='hsl(45 90% 78%)'/>
		</svg>`
	)

export const ZProgressiveBlurDoc = () => (
	<ComponentDoc
		tag="z-progressive-blur"
		category="Specialized"
		description="Wraps slotted content and fades a blur in from one edge — for legible text over a busy image."
	>
		<div className="block">
			<div className="panel">
				<div className="row" style={{ gap: '1.5rem', flexWrap: 'wrap' }}>
					<z-progressive-blur direction="bottom" style={{ width: '18rem', height: '12rem', display: 'block' }}>
						<img src={IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
					</z-progressive-blur>

					<z-progressive-blur direction="top" strength="lg" style={{ width: '18rem', height: '12rem', display: 'block' }}>
						<img src={IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
					</z-progressive-blur>
				</div>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Text overlay</h3>
				<span className="desc">bottom blur gives an overlaid label room to breathe</span>
			</div>
			<div className="panel">
				<z-progressive-blur direction="bottom" reach={55} style={{ width: '22rem', height: '13rem', display: 'block', borderRadius: 'var(--radius-lg)' }}>
					<img src={IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
					<z-stack
						isColumn
						gap="0"
						style={{ position: 'absolute', left: '1rem', right: '1rem', bottom: '1rem' }}
					>
						<z-heading size="xs" tag="h3" color="white">
							Coastal ridge
						</z-heading>
						<z-text size="sm" color="white" style={{ opacity: 0.85 }}>
							Big Sur, California
						</z-text>
					</z-stack>
				</z-progressive-blur>
			</div>
		</div>
	</ComponentDoc>
)
