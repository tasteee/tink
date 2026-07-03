import { ComponentDoc } from '@app/docs/ComponentDoc'

export const ZToggleGroupDoc = () => (
	<ComponentDoc
		tag="z-toggle-group"
		category="Actions"
		description={'Coordinates a set of z-toggle-group-item children — `type="single"` or `"multiple"` selection.'}
	>
		<div className="block">
			<div className="panel">
				<div className='micro'>Group — single select</div>
				<div className='row'>
					<z-toggle-group type='single' isOutlined isPurple>
						<z-toggle-group-item value='left'>Left</z-toggle-group-item>
						<z-toggle-group-item value='center' isPressed>Center</z-toggle-group-item>
						<z-toggle-group-item value='right'>Right</z-toggle-group-item>
					</z-toggle-group>
				</div>
				<div className='micro' style={{ marginTop: '2rem' }}>Group — multiple select</div>
				<div className='row'>
					<z-toggle-group type='multiple' isOutlined>
						<z-toggle-group-item value='bold' isPressed>Bold</z-toggle-group-item>
						<z-toggle-group-item value='italic'>Italic</z-toggle-group-item>
						<z-toggle-group-item value='underline'>Underline</z-toggle-group-item>
					</z-toggle-group>
				</div>
			</div>
		</div>
	</ComponentDoc>
)
