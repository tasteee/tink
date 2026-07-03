import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZCheckboxDoc = () => (
	<ComponentDoc tag="z-checkbox" category="Forms" description="Checked, indeterminate, tone, and disabled states.">
		<div className="block">
			<div className="panel">
				<div className='col'>
					<z-checkbox isChecked>Accept terms</z-checkbox>
					<z-checkbox>Subscribe to updates</z-checkbox>
					<z-checkbox isIndeterminate>Partial selection</z-checkbox>
					<z-checkbox tone='secondary' isChecked>Pink tone</z-checkbox>
					<z-checkbox isDisabled>Disabled</z-checkbox>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
