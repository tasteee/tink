import { ComponentDoc } from '@app/docs/ComponentDoc'
import { withProps } from '@app/docs/withProps'

const SELECT_OPTIONS = [
	{ value: 'bold', label: 'Bold' },
	{ value: 'calm', label: 'Calm' },
	{ value: 'electric', label: 'Electric' },
	{ value: 'minimal', label: 'Minimal', isDisabled: true }
]

export const ZSelectDoc = () => (
	<ComponentDoc tag="z-select" category="Forms" description="A dropdown select with an `options` array — each option can be `isDisabled`.">
		<div className="block">
			<div className="panel">
				<div className='field'>
					<label>Select</label>
					<z-select placeholder='Pick a vibe' ref={withProps({ options: SELECT_OPTIONS })} />
				</div>
			</div>
		</div>
	</ComponentDoc>
)
