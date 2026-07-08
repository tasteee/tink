import { ComponentDoc } from '@app/docs/ComponentDoc'
import { withProps } from '@app/docs/withProps'

const MODELS = [
	{ value: 'opus', name: 'Opus 4.8', description: 'Most capable — deep reasoning' },
	{ value: 'sonnet', name: 'Sonnet 5', description: 'Balanced speed and quality' },
	{ value: 'haiku', name: 'Haiku 4.5', description: 'Fastest, most affordable' }
]

export const ZModelPickerDoc = () => (
	<ComponentDoc
		tag="z-model-picker"
		category="Chat"
		description="The composer control for choosing which model answers. Shows the selected model and opens a dropdown of options (name + description, check on the current one). Emits change {value}. Data-driven via the models property; menu-below flips it under the trigger."
	>
		<div className="block">
			<div className="panel" style={{ minHeight: '10rem', display: 'flex', alignItems: 'flex-end' }}>
				<z-model-picker ref={withProps({ models: MODELS, value: 'opus' })} />
			</div>
		</div>

		<div className="block">
			<h3>Menu below</h3>
			<div className="panel">
				<z-model-picker menu-below ref={withProps({ models: MODELS, value: 'sonnet' })} />
			</div>
		</div>
	</ComponentDoc>
)
