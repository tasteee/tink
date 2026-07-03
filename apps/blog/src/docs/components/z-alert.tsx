import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZAlertDoc = () => (
	<ComponentDoc tag="z-alert" category="Overlays" description="An inline status banner — info, success, warning, danger tones; optional dismiss.">
		<div className="block">
			<div className="panel">
				<div className='col' style={{ gap: '1rem', alignItems: 'stretch' }}>
					<z-alert tone='info' heading='Heads up'>A new version is available — refresh when convenient.</z-alert>
					<z-alert tone='success' heading='Saved'>Your changes have been published.</z-alert>
					<z-alert tone='warning' heading='Approaching limit'>You've used 90% of your monthly quota.</z-alert>
					<z-alert tone='danger' heading='Payment failed' isDismissable>We couldn't process your card. Update your billing details.</z-alert>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
