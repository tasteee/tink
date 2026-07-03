import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZCarouselDoc = () => (
	<ComponentDoc tag="z-carousel" category="Specialized" description="Slides with dots and optional autoplay.">
		<div className="block">
			<div className="panel">
				<z-carousel loop autoplay={5000}>
					<z-card isFlex isColumn gap='2' style={{ height: '12rem', justifyContent: 'center', alignItems: 'center', border: 0, background: 'color-mix(in oklch, var(--purple) 14%, transparent)' }}>
						<z-heading size='xs' tag='h3'>Ship inward</z-heading>
						<z-text size='sm' color='muted'>Slide one</z-text>
					</z-card>
					<z-card isFlex isColumn gap='2' style={{ height: '12rem', justifyContent: 'center', alignItems: 'center', border: 0, background: 'color-mix(in oklch, var(--pink) 14%, transparent)' }}>
						<z-heading size='xs' tag='h3'>Name it well</z-heading>
						<z-text size='sm' color='muted'>Slide two</z-text>
					</z-card>
				</z-carousel>
			</div>
		</div>
	</ComponentDoc>
)
