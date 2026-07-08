import { ComponentDoc } from '@app/docs/ComponentDoc'

const LOGOS = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Soylent', 'Hooli']

export const ZMarqueeDoc = () => (
	<ComponentDoc
		tag="z-marquee"
		category="Specialized"
		description="Infinite auto-scrolling row over slotted content — pause on hover, reverse, vertical, edge fade."
	>
		<div className="block">
			<div className="block-title">
				<h3>Default</h3>
			</div>
			<div className="panel">
				<z-marquee pauseOnHover hasFade>
					{LOGOS.map((name) => (
						<z-badge key={name} kind="outline" label={name} style={{ padding: '0.75rem 1.25rem', fontSize: '1rem' }} />
					))}
				</z-marquee>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Reverse, faster</h3>
			</div>
			<div className="panel">
				<z-marquee reverse duration={18} hasFade>
					{LOGOS.map((name) => (
						<z-badge key={name} tone="secondary" kind="soft" label={name} style={{ padding: '0.75rem 1.25rem', fontSize: '1rem' }} />
					))}
				</z-marquee>
			</div>
		</div>

		<div className="block">
			<div className="block-title">
				<h3>Vertical</h3>
				<span className="desc">height-constrained container, scrolling on the Y axis</span>
			</div>
			<div className="panel">
				<div style={{ height: '12rem' }}>
					<z-marquee vertical pauseOnHover hasFade style={{ height: '100%' }}>
						{LOGOS.map((name) => (
							<z-badge key={name} kind="outline" label={name} style={{ padding: '0.6rem 1rem' }} />
						))}
					</z-marquee>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
