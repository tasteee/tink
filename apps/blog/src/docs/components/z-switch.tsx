import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZSwitchDoc = () => (
	<ComponentDoc tag="z-switch" category="Forms" description="A boolean toggle — tone and disabled variants.">
		<div className="block">
			<div className="panel">
				<div className='col'>
					<z-switch isChecked>Notifications</z-switch>
					<z-switch tone='secondary'>Pink switch</z-switch>
					<z-switch isDisabled>Disabled</z-switch>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
