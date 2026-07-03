import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZColorPickerDoc = () => (
	<ComponentDoc tag="z-color-picker" category="Forms" description="A hex color input with a swatch trigger.">
		<div className="block">
			<div className="panel">
				<div className='field'>
					<label>Brand color</label>
					<z-color-picker value='#BF40BF' />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
