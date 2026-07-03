import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZScrollAreaDoc = () => (
	<ComponentDoc
		tag="z-scroll-area"
		category="Specialized"
		description="A themed scroll region — slimmer scrollbars than the browser default."
	>
		<div className="block">
			<div className="panel">
				<div className='micro'>Scroll area — max-height</div>
				<z-scroll-area maxHeight='11rem' orientation='vertical'>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.75rem' }}>
						<z-text size='sm'>Internal platforms accrete usage the way products do.</z-text>
						<z-text size='sm' color='muted'>Scroll to see the themed scrollbar.</z-text>
						<z-text size='sm'>A brand is a compression algorithm for trust.</z-text>
						<z-text size='sm' color='muted'>Documentation is the product surface.</z-text>
						<z-text size='sm'>Treat engineers as users.</z-text>
					</div>
				</z-scroll-area>
			</div>
		</div>
	</ComponentDoc>
)
