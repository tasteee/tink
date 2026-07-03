import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZRadioGroupDoc = () => (
	<ComponentDoc tag="z-radio-group" category="Forms" description="Coordinates a set of z-radio children — single selection, optional group label.">
		<div className="block">
			<div className="panel">
				<z-radio-group value='monthly' label='Billing'>
					<z-radio value='monthly'>Monthly</z-radio>
					<z-radio value='yearly'>Yearly</z-radio>
					<z-radio value='lifetime' isDisabled>Lifetime (soon)</z-radio>
				</z-radio-group>
			</div>
		</div>
	</ComponentDoc>
)
