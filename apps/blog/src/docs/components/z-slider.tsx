import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZSliderDoc = () => (
	<ComponentDoc tag="z-slider" category="Forms" description="A single-handle, accent-filled range input.">
		<div className="block">
			<div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '480px' }}>
				<z-slider value={60} />
				<z-slider label='Opacity' value={80} showValue valueSuffix='%' />
				<z-slider label='Budget' min={0} max={5000} value={2500} tone='secondary' showValue valuePrefix='$' />
				<z-slider value={50} isDisabled />
			</div>
		</div>
	</ComponentDoc>
)
